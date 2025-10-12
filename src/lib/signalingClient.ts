import { Client, IMessage, StompHeaders } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '@/utils/authToken';
import type { WebRTCSignal } from '@/lib/types';

/* ----------------------------- 서버 페이로드 타입 ----------------------------- */
type ServerOfferAnswer = {
  type: 'OFFER' | 'ANSWER';
  fromUserId: number | string;
  targetUserId?: number | string;
  roomId?: number;
  sdp: RTCSessionDescriptionInit;
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
  error?: { code?: string; message?: string };
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
  return (p.type === 'OFFER' || p.type === 'ANSWER') && (p as ServerOfferAnswer).sdp !== undefined;
}
function isIce(p: ServerSignal): p is ServerIce {
  return p.type === 'ICE_CANDIDATE' && (p as ServerIce).candidate !== undefined;
}
function isMediaState(p: ServerSignal): p is ServerMediaState {
  return p.type === 'MEDIA_STATE';
}
function isServerError(p: ServerSignal): p is ServerError {
  return p.type === 'ERROR';
}

/* ================================== Client ================================== */
export default class SignalingClient {
  private client: Client;
  private _ready = false;

  get ready()   { return this._ready; }
  get isReady() { return this._ready; }

  constructor(
    private roomId: string,   // 'room-3' 형태 가능
    private userId: string,   // 'u-3' 형태 가능
    private onSignal: (s: WebRTCSignal) => void,
    private onReady?: () => void,
    private onMediaState?: (userId: string, state: MediaState) => void,
  ) {
    const RAW_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:8080/ws';
    const token = (getAccessToken() || '').replace(/^Bearer\s+/i, '');
    const urlWithToken = token ? `${RAW_URL}?access_token=${encodeURIComponent(token)}` : RAW_URL;

    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.log('[WS] endpoint =', urlWithToken);
      console.log('[WS] token.length =', token?.length ?? 0);
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(urlWithToken),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: isDev ? (m: string) => console.log('[STOMP]', m) : () => {},
      reconnectDelay: 3000,

      onConnect: () => {
        this._ready = true;
        if (isDev) console.log('[STOMP] connected');

        // 개인 큐
        const userQ = `/user/queue/webrtc`;
        if (isDev) console.log('[STOMP] SUB', userQ);
        this.client.subscribe(userQ, (frame: IMessage) => this.handleFrame(frame, 'userQ'));

        // 방 토픽(숫자 아이디로 통일)
        const roomTopic = `/topic/room/${toNumericId(this.roomId)}/webrtc`;
        if (isDev) console.log('[STOMP] SUB', roomTopic);
        this.client.subscribe(roomTopic, (frame: IMessage) => this.handleFrame(frame, 'room'));

        this.onReady?.();
      },

      onStompError: (f: { headers: StompHeaders; body: string }) => {
        console.error('[STOMP] broker error:', f.headers['message'], f.body);
        const msg = (f.headers['message'] || '').toLowerCase();
        if (msg.includes('not authorized') || /인증|token|unauth/i.test(msg)) {
          console.warn('[STOMP] 인증 오류 가능성 → 토큰 전달위치(쿼리/CONNECT)/만료 확인');
        }
      },

      onWebSocketError: (e: Event) => {
        if (isDev) console.warn('[STOMP] WS error:', e instanceof Event ? e.type : e);
        else console.error('[STOMP] WS error');
      },
    } as any);

    // 종료 사유 로깅(디버그에 유용)
    (this.client as any).onWebSocketClose = (e: CloseEvent) => {
      if (isDev) console.warn('[STOMP] WS closed:', e?.code, e?.reason || '(no reason)');
    };

    this.client.activate();
  }

  /* ------------------------------- 수신 처리부 ------------------------------- */
  private handleFrame(frame: IMessage, src: 'userQ' | 'room') {
    const payload = safeJsonParse<ServerSignal>(frame.body);
    if (!payload) {
      console.error('[STOMP] parse error (invalid JSON)', frame.body);
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[STOMP][${src}] <-`, payload);
    }

    if (isServerError(payload)) {
      console.warn('[STOMP] ERROR payload:', payload);
      return;
    }

    const from = 'fromUserId' in payload ? String(payload.fromUserId ?? '') : '';
    const to =
      'targetUserId' in payload && payload.targetUserId != null
        ? String(payload.targetUserId)
        : undefined;

    if (isOfferAnswer(payload)) {
      const kind: WebRTCSignal['type'] = payload.type === 'OFFER' ? 'offer' : 'answer';
      this.onSignal({ type: kind, fromUserId: from, toUserId: to, sdp: payload.sdp });
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('[STOMP] ->', dest, body);
    }
    this.client.publish({ destination: dest, body: JSON.stringify(body) });
  }

  /** WebRTC 시그널 전송 (offer/answer/ice) — 모든 ID는 숫자로 정규화 */
  sendSignal(signal: WebRTCSignal) {
    const roomIdNum = toNumericId(this.roomId);
    const targetIdNum = signal.toUserId ? toNumericId(signal.toUserId) : null;
    const fromIdNum = toNumericId(this.userId);

    if (signal.type === 'offer' || signal.type === 'answer') {
      const dest = signal.type === 'offer' ? '/app/webrtc/offer' : '/app/webrtc/answer';
      this.pub(dest, {
        roomId: roomIdNum,
        fromUserId: fromIdNum,
        targetUserId: targetIdNum,
        sdp: signal.sdp,
        mediaType: 'VIDEO' as const,
      });
      return;
    }

    if (signal.type === 'ice') {
      const dest = '/app/webrtc/ice-candidate';
      const c = signal.candidate;
      this.pub(dest, {
        roomId: roomIdNum,
        fromUserId: fromIdNum,
        targetUserId: targetIdNum,
        candidate: c?.candidate ?? '',
        sdpMid: c?.sdpMid ?? null,
        sdpMLineIndex: c?.sdpMLineIndex ?? null,
      });
    }
  }

  /** 내 미디어 상태 브로드캐스트(옵션) */
  sendMediaState(state: MediaState, toUserId?: string) {
    const dest = '/app/webrtc/media-state';
    this.pub(dest, {
      type: 'MEDIA_STATE' as const,
      roomId: toNumericId(this.roomId),
      fromUserId: toNumericId(this.userId),
      targetUserId: toUserId ? toNumericId(toUserId) : null,
      micOn: !!state.micOn,
      camOn: !!state.camOn,
      shareOn: !!state.shareOn,
      timestamp: new Date().toISOString(),
    });
  }

  disconnect() {
    this.client.deactivate();
  }
}
