import { Client, IMessage, IFrame, StompHeaders, IStompSocket } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '@/utils/authToken';
import type { WebRTCSignal } from '@/lib/types';

/* ----------------------------- 서버 페이로드 타입 ----------------------------- */
type ServerOfferAnswer = {
  type: 'OFFER' | 'ANSWER';
  fromUserId: number | string;
  targetUserId?: number | string;
  roomId?: number;
  sdp: string | RTCSessionDescriptionInit;
  sdpType?: 'offer' | 'answer' | 'OFFER' | 'ANSWER';
  mediaType?: 'VIDEO' | 'AUDIO';
};

type ServerIce = {
  type: 'ICE_CANDIDATE';
  fromUserId: number | string;
  targetUserId?: number | string;
  roomId?: number;
  candidate: string | { candidate: string };
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
};

type ServerMediaState = {
  type: 'MEDIA_STATE';
  fromUserId: number | string;
  targetUserId?: number | string;
  roomId?: number;
  micOn?: boolean;
  camOn?: boolean;
  shareOn?: boolean;
  timestamp?: string;
};

type ServerError = {
  type: 'ERROR';
  error?: { code?: string; message?: string; detail?: string };
  timestamp?: string;
};

type ServerSignal = ServerOfferAnswer | ServerIce | ServerMediaState | ServerError;

/* -------------------------------- 유틸/가드 ---------------------------------- */
export type MediaState = { micOn: boolean; camOn: boolean; shareOn: boolean };

function toNumericId(input: string): number {
  const part = input.split('-')[1] ?? input;
  const n = Number(part);
  return Number.isFinite(n) ? n : 0;
}
function safeJsonParse<T>(raw: string): T | undefined {
  try { return JSON.parse(raw) as T; } catch { return undefined; }
}

function isOfferAnswer(p: ServerSignal): p is ServerOfferAnswer {
  return (p.type === 'OFFER' || p.type === 'ANSWER') && 'sdp' in p;
}
function isIce(p: ServerSignal): p is ServerIce {
  return p.type === 'ICE_CANDIDATE' && 'candidate' in p;
}
function isMediaState(p: ServerSignal): p is ServerMediaState {
  return p.type === 'MEDIA_STATE';
}
function isServerError(p: ServerSignal): p is ServerError {
  return p.type === 'ERROR';
}

const DEBUG = process.env.NODE_ENV !== 'production';
const dlog = (...a: unknown[]) => { if (DEBUG) console.log('[STOMP]', ...a); };

/* ================================== Client ================================== */
export default class SignalingClient {
  private client: Client;
  private _ready = false;
  private retryCount = 0;
  private readonly MAX_RETRY = 5;
  private stoppedByAuthError = false;
  private activated = false; // StrictMode 중복 방지

  get ready()   { return this._ready; }
  get isReady() { return this._ready; }

  constructor(
    private roomId: string,
    private userId: string,
    private onSignal: (s: WebRTCSignal) => void,
    private onReady?: () => void,
    private onMediaState?: (userId: string, state: MediaState) => void,
    private onAuthError?: (reason?: string) => void,
  ) {
    const RAW_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:8080/ws';
    const token = (getAccessToken() || '').replace(/^Bearer\s+/i, '');
    const urlWithToken = token ? `${RAW_URL}?access_token=${encodeURIComponent(token)}` : RAW_URL;

    if (DEBUG) {
      dlog('endpoint =', urlWithToken);
      dlog('token.length =', token?.length ?? 0);
    }

    this.client = new Client({
      // SockJS -> IStompSocket 로 캐스팅
      webSocketFactory: () => new SockJS(urlWithToken) as unknown as IStompSocket,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: DEBUG ? (m: string) => dlog(m) : () => {},
      reconnectDelay: 3000,

      onConnect: (_frame?: IFrame) => {
        this._ready = true;
        this.retryCount = 0;
        dlog('connected');

        const userQ = `/user/queue/webrtc`;
        dlog('SUB', userQ);
        this.client.subscribe(userQ, (frame: IMessage) => this.handleFrame(frame, 'userQ'));

        const roomTopic = `/topic/room/${toNumericId(this.roomId)}/media-status`;
        dlog('SUB', roomTopic);
        this.client.subscribe(roomTopic, (frame: IMessage) => this.handleFrame(frame, 'room-media'));

        this.onReady?.();
      },

      onStompError: (frame: IFrame) => {
        const msgHdr = frame.headers['message'] ?? '';
        dlog('broker error:', msgHdr, frame.body);
        const raw = (msgHdr + ' ' + frame.body).toLowerCase();
        if (/unauth|un\.auth|auth|인증|token/.test(raw)) this.stopReconnect('auth-error(stomp)');
      },

      onWebSocketError: (e: Event) => {
        dlog('WS error:', (e as { message?: string; type?: string } | undefined)?.message || e.type);
      },
    });

    // 공식 콜백으로 제공됨 — 캐스팅 불필요
    this.client.onWebSocketClose = (e: CloseEvent) => {
      dlog('WS closed:', e?.code, e?.reason || '(no reason)');

      const reason = (e?.reason || '').toLowerCase();
      if (e?.code === 1008 || /auth|token|인증/.test(reason)) {
        this.stopReconnect('auth-error(ws-close)');
        return;
      }

      if (this.stoppedByAuthError) return;
      if (this.retryCount >= this.MAX_RETRY) {
        dlog('retry max reached, stop reconnect');
        this.client.reconnectDelay = 0;
        return;
      }

      this.retryCount += 1;
      const backoff = Math.min(3000 * 2 ** (this.retryCount - 1), 30000);
      this.client.reconnectDelay = backoff;
      dlog(`schedule reconnect (#${this.retryCount}) in ~${backoff}ms`);
    };

    this.activate();
  }

  private activate() {
    if (this.activated) return;
    this.activated = true;
    this.client.activate();
  }

  private stopReconnect(reason: string) {
    if (this.stoppedByAuthError) return;
    this.stoppedByAuthError = true;
    dlog('stop reconnect due to', reason);
    this.client.reconnectDelay = 0;
    try { this.client.deactivate(); } catch {}
    this._ready = false;
    this.activated = false;
    this.onAuthError?.(reason);
  }

  /* ------------------------------- 수신 처리부 ------------------------------- */
  private handleFrame(frame: IMessage, src: 'userQ' | 'room-media') {
    const payload = safeJsonParse<ServerSignal>(frame.body);
    if (!payload) {
      console.error('[STOMP] parse error (invalid JSON)', frame.body);
      return;
    }
    dlog(`[${src}] <-`, payload);

    if (isServerError(payload)) {
      console.warn('[STOMP][ERROR]', {
        code: payload.error?.code,
        message: payload.error?.message,
        detail: (payload as { error?: { detail?: string } }).error?.detail,
        raw: payload,
      });
      const msg = (payload.error?.message || '').toLowerCase();
      if (/unauth|auth|인증|token/.test(msg)) this.stopReconnect('auth-error(server-error)');
      return;
    }

    const from = 'fromUserId' in payload ? String(payload.fromUserId ?? '') : '';
    const to =
      'targetUserId' in payload && payload.targetUserId != null
        ? String(payload.targetUserId)
        : undefined;

    if (isOfferAnswer(payload)) {
      const lowerType =
        (payload.sdpType?.toString().toLowerCase() as 'offer' | 'answer' | undefined) ??
        (payload.type === 'OFFER' ? 'offer' : 'answer');
      const remote: RTCSessionDescriptionInit =
        typeof payload.sdp === 'string'
          ? { type: lowerType, sdp: payload.sdp }
          : payload.sdp;
      const kind: WebRTCSignal['type'] = payload.type === 'OFFER' ? 'offer' : 'answer';
      this.onSignal({ type: kind, fromUserId: from, toUserId: to, sdp: remote });
      return;
    }

    if (isIce(payload)) {
      const cand = typeof payload.candidate === 'string' ? payload.candidate : payload.candidate.candidate;
      const candInit: RTCIceCandidateInit = {
        candidate: cand,
        sdpMid: payload.sdpMid ?? null,
        sdpMLineIndex: payload.sdpMLineIndex ?? null,
      };
      this.onSignal({ type: 'ice', fromUserId: from, toUserId: to, candidate: candInit });
      return;
    }

    if (isMediaState(payload)) {
      const ms: MediaState = {
        micOn: !!payload.micOn,
        camOn: !!payload.camOn,
        shareOn: !!payload.shareOn,
      };
      this.onMediaState?.(from, ms);
      return;
    }

    console.warn('[STOMP] unknown payload', payload);
  }

  /* -------------------------------- 발신 유틸 -------------------------------- */
  private pub<T extends object>(dest: string, body: T) {
    dlog('->', dest, body);
    this.client.publish({ destination: dest, body: JSON.stringify(body) });
  }

  /** WebRTC 시그널 전송 (offer/answer/ice) — 모든 ID는 숫자로 정규화 */
  sendSignal(signal: WebRTCSignal) {
    const roomIdNum = toNumericId(this.roomId);
    const targetIdNum = signal.toUserId ? toNumericId(signal.toUserId) : undefined;
    const fromIdNum = toNumericId(this.userId);

    if (signal.type === 'offer' || signal.type === 'answer') {
      const dest = signal.type === 'offer' ? '/app/webrtc/offer' : '/app/webrtc/answer';
      const sdpText = signal.sdp?.sdp ?? '';
      const sdpType: 'offer' | 'answer' =
        (signal.sdp?.type === 'answer' ? 'answer' : 'offer');

      this.pub(dest, {
        roomId: roomIdNum,
        fromUserId: fromIdNum,
        targetUserId: targetIdNum ?? null,
        sdp: sdpText,
        sdpType,
        mediaType: 'VIDEO' as const,
      });
      return;
    }

    if (signal.type === 'ice') {
      const dest = '/app/webrtc/ice-candidate';
      const c = signal.candidate!;
      this.pub(dest, {
        roomId: roomIdNum,
        fromUserId: fromIdNum,
        targetUserId: targetIdNum ?? null,
        candidate: c.candidate ?? '',
        sdpMid: c.sdpMid ?? null,
        sdpMLineIndex: c.sdpMLineIndex ?? null,
      });
    }
  }

  /** 내 미디어 상태 브로드캐스트 */
  sendMediaState(state: MediaState, toUserId?: string) {
    const dest = '/app/webrtc/media/toggle';
    this.pub(dest, {
      roomId: toNumericId(this.roomId),
      fromUserId: toNumericId(this.userId),
      targetUserId: toUserId ? toNumericId(toUserId) : null,
      micOn: !!state.micOn,
      camOn: !!state.camOn,
      shareOn: !!state.shareOn,
      timestamp: new Date().toISOString(),
      type: 'MEDIA_STATE' as const,
    });
  }

  disconnect() {
    dlog('manual disconnect');
    this.stoppedByAuthError = true;
    this.client.reconnectDelay = 0;
    this.client.deactivate();
    this._ready = false;
    this.activated = false;
  }
}
