import { Client, IMessage, IFrame, IStompSocket } from '@stomp/stompjs';
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
  mediaType?: 'VIDEO' | 'AUDIO' | 'SCREEN'; // [수정] SCREEN 타입 추가
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

// [수정] 백엔드 DTO와 일치하도록 미디어 상태 타입 변경
type ServerMediaState = {
  type: 'MEDIA_STATE_CHANGE'; // 타입 이름 명확화
  userId: number | string;
  username: string;
  mediaType: 'AUDIO' | 'VIDEO' | 'SCREEN';
  enabled: boolean;
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
// [수정] 백엔드에 보낼 미디어 타입 정의
export type TogglingMediaType = 'AUDIO' | 'VIDEO' | 'SCREEN';

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
  // [수정] 변경된 타입 이름으로 확인
  return p.type === 'MEDIA_STATE_CHANGE';
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
  private activated = false;

  get ready() { return this._ready; }
  get isReady() { return this._ready; }

  // [추가] 리스너 관리
  private signalListeners = new Set<(s: WebRTCSignal) => void>();
  private mediaStateListeners = new Set<(userId: string, state: ServerMediaState) => void>();

  constructor(
    private roomId: string,
    private userId: string,
    // [삭제] 생성자에서 콜백을 직접 받지 않음
    // private onSignal: (s: WebRTCSignal) => void,
    private onReady?: () => void,
    // private onMediaState?: (userId: string, state: MediaState) => void,
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
      webSocketFactory: () => new SockJS(urlWithToken) as unknown as IStompSocket,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: DEBUG ? (m: string) => dlog(m) : () => { },
      reconnectDelay: 3000,

      onConnect: (_frame?: IFrame) => {
        this._ready = true;
        this.retryCount = 0;
        dlog('connected');

        // [수정] 백엔드와 일치하도록 에러 큐 주소 변경
        const errorQ = `/user/queue/errors`;
        dlog('SUB', errorQ);
        this.client.subscribe(errorQ, (frame: IMessage) => this.handleFrame(frame, 'errorQ'));

        // WebRTC 시그널링 토픽 구독
        const roomWebrtcTopic = `/topic/room/${toNumericId(this.roomId)}/webrtc`;
        dlog('SUB', roomWebrtcTopic);
        this.client.subscribe(roomWebrtcTopic, (frame: IMessage) => this.handleFrame(frame, 'room-webrtc'));

        // 미디어 상태 토픽 구독
        const roomMediaTopic = `/topic/room/${toNumericId(this.roomId)}/media-status`;
        dlog('SUB', roomMediaTopic);
        this.client.subscribe(roomMediaTopic, (frame: IMessage) => this.handleFrame(frame, 'room-media'));

        this.joinRoom();
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

  // [추가] 리스너 등록/해제 메서드
  addSignalListener(listener: (s: WebRTCSignal) => void) {
    this.signalListeners.add(listener);
  }
  removeSignalListener(listener: (s: WebRTCSignal) => void) {
    this.signalListeners.delete(listener);
  }
  addMediaStateListener(listener: (userId: string, state: ServerMediaState) => void) {
    this.mediaStateListeners.add(listener);
  }
  removeMediaStateListener(listener: (userId: string, state: ServerMediaState) => void) {
    this.mediaStateListeners.delete(listener);
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
    try { this.client.deactivate(); } catch { }
    this._ready = false;
    this.activated = false;
    this.onAuthError?.(reason);
  }

  /* ------------------------------- 수신 처리부 ------------------------------- */
  private handleFrame(frame: IMessage, src: 'errorQ' | 'room-webrtc' | 'room-media') {
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

    const from = 'fromUserId' in payload ? String(payload.fromUserId ?? '') : ('userId' in payload ? String(payload.userId) : '');
    const to =
      'targetUserId' in payload && payload.targetUserId != null
        ? String(payload.targetUserId)
        : undefined;

    if (src === 'room-webrtc') {
      const myNumericId = toNumericId(this.userId);
      const targetNumericId = to ? toNumericId(to) : null;
      if (targetNumericId !== null && targetNumericId !== myNumericId) {
        return;
      }
    }

    if (isOfferAnswer(payload)) {
      const lowerType = (payload.sdpType?.toString().toLowerCase() as 'offer' | 'answer' | undefined) ?? (payload.type === 'OFFER' ? 'offer' : 'answer');
      const remoteSdp: RTCSessionDescriptionInit = typeof payload.sdp === 'string' ? { type: lowerType, sdp: payload.sdp } : payload.sdp;
      const signal: WebRTCSignal = { type: payload.type === 'OFFER' ? 'offer' : 'answer', fromUserId: from, toUserId: to, sdp: remoteSdp };
      this.signalListeners.forEach(cb => cb(signal));
      return;
    }

    if (isIce(payload)) {
      const cand = typeof payload.candidate === 'string' ? payload.candidate : payload.candidate.candidate;
      const candInit: RTCIceCandidateInit = {
        candidate: cand,
        sdpMid: payload.sdpMid ?? null,
        sdpMLineIndex: payload.sdpMLineIndex ?? null,
      };
      const signal: WebRTCSignal = { type: 'ice', fromUserId: from, toUserId: to, candidate: candInit };
      this.signalListeners.forEach(cb => cb(signal));
      return;
    }

    if (isMediaState(payload)) {
      // [수정] 변경된 ServerMediaState 타입으로 리스너에 전달
      this.mediaStateListeners.forEach(cb => cb(from, payload));
      return;
    }

    console.warn('[STOMP] unknown payload', payload);
  }

  /* -------------------------------- 발신 유틸 -------------------------------- */
  private pub<T extends object>(dest: string, body: T) {
    if (!this.client.active) {
      dlog('Cannot publish. Client not active.', dest, body);
      return;
    }
    dlog('->', dest, body);
    this.client.publish({ destination: dest, body: JSON.stringify(body) });
  }

  joinRoom() {
    const roomIdNum = toNumericId(this.roomId);
    const userIdNum = toNumericId(this.userId);
    dlog('JOIN room', roomIdNum, 'user', userIdNum);
    this.pub(`/app/rooms/${roomIdNum}/join`, {
      roomId: roomIdNum,
      userId: userIdNum,
    });
  }

  sendSignal(signal: WebRTCSignal) {
    const roomIdNum = toNumericId(this.roomId);
    const targetIdNum = signal.toUserId ? toNumericId(signal.toUserId) : undefined;
    const fromIdNum = toNumericId(this.userId);

    if (signal.type === 'offer' || signal.type === 'answer') {
      const dest = signal.type === 'offer' ? '/app/webrtc/offer' : '/app/webrtc/answer';
      const sdpText = signal.sdp?.sdp ?? '';
      const sdpType = (signal.sdp?.type === 'answer' ? 'answer' : 'offer');

      this.pub(dest, {
        roomId: roomIdNum,
        fromUserId: fromIdNum,
        targetUserId: targetIdNum ?? null,
        sdp: sdpText,
        // [수정] 백엔드 DTO에 맞게 mediaType 전달
        mediaType: 'VIDEO',
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

  // [수정] 백엔드 DTO에 맞게 미디어 상태 전송 메서드 변경
  sendMediaToggle(mediaType: TogglingMediaType, enabled: boolean) {
    const dest = '/app/webrtc/media/toggle';
    this.pub(dest, {
      roomId: toNumericId(this.roomId),
      mediaType,
      enabled,
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
