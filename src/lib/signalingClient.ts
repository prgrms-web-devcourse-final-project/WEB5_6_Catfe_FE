// src/lib/signalingClient.ts
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

/* -------------------------------- 유틸 타입/함수 ------------------------------ */
export type MediaState = { micOn: boolean; camOn: boolean; shareOn: boolean };

function toNumericId(input: string): number {
  const part = input.split('-')[1] ?? input;
  const n = Number(part);
  return Number.isFinite(n) ? n : 0;
}

function safeJsonParse<T>(raw: string): T | undefined {
  try { return JSON.parse(raw) as T; } catch { return undefined; }
}

/* -------------------------------- 타입 가드 ---------------------------------- */
function isOfferAnswer(p: ServerSignal): p is ServerOfferAnswer {
  return (p.type === 'OFFER' || p.type === 'ANSWER') && typeof (p as ServerOfferAnswer).sdp !== 'undefined';
}
function isIce(p: ServerSignal): p is ServerIce {
  return p.type === 'ICE_CANDIDATE' && typeof (p as ServerIce).candidate !== 'undefined';
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
<<<<<<< HEAD
  private _ready = false;

  get ready()   { return this._ready; }
  get isReady() { return this._ready; }
=======
  private connected = false;
  private outboundQueue: WebRTCSignal[] = [];
>>>>>>> 7b9b1ce (브랜치 최신화)

  constructor(
    private roomId: string,
    private userId: string,
    private onSignal: (s: WebRTCSignal) => void,
    private onReady?: () => void,
    private onMediaState?: (userId: string, state: MediaState) => void,
  ) {
<<<<<<< HEAD
    const RAW_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:8080/ws';
    const token = (getAccessToken() || '').replace(/^Bearer\s+/i, '');
    const urlWithToken = token ? `${RAW_URL}?access_token=${encodeURIComponent(token)}` : RAW_URL;

    // 디버그
    console.log('[WS] endpoint =', urlWithToken);
    console.log('[WS] token.length =', token?.length ?? 0);

    this.client = new Client({
      webSocketFactory: () => new SockJS(urlWithToken),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (m) => console.log('[STOMP]', m),
      reconnectDelay: 3000,

      onConnect: () => {
        this._ready = true;
        console.log('[STOMP] connected'); 

        const userQ = `/user/queue/webrtc`;
        console.log('[STOMP] SUB', userQ);
        this.client.subscribe(userQ, (frame: IMessage) => this.handleFrame(frame, 'userQ'));

        const roomTopic = `/topic/room/${this.roomId}/webrtc`;
        console.log('[STOMP] SUB', roomTopic); 
        this.client.subscribe(roomTopic, (frame: IMessage) => this.handleFrame(frame, 'room'));

        this.onReady?.();
      },

      onStompError: (f: { headers: StompHeaders; body: string }) => {
        console.error('[STOMP] broker error:', f.headers['message'], f.body);
        const msg = (f.headers['message'] || '').toLowerCase();
        if (msg.includes('not authorized') || /인증|token|unauth/i.test(msg)) {
          console.warn('[STOMP] 인증 문제로 보입니다. 토큰/전달 위치(쿼리 or CONNECT)/만료 여부를 확인하세요.');
        }
      },

      onWebSocketError: (e: Event) => {
        console.error('[STOMP] WS error:', e instanceof Event ? e.type : e);
=======
    const WS_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:8080/ws';
    const token = getAccessToken();
    console.log('[STOMP] init', WS_URL);

    // SockJS 인스턴스 생성 및 상태 로그
    const sock = new SockJS(WS_URL, null, {
      transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
      timeout: 45000,
    });
    sock.onopen = () => console.log('[SockJS] open');
    sock.onclose = (e: any) => console.warn('[SockJS] close', e);
    sock.onerror = (e: any) => console.error('[SockJS] error', e);

    this.client = new Client({
      webSocketFactory: () => sock as any,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (m) => console.log('[STOMP]', m),
      reconnectDelay: 3000,

      onConnect: () => {
        console.log('[STOMP] connected');
        this.connected = true;

        const topic = `/topic/room/${this.roomId}/webrtc`;
        console.log('[STOMP] subscribe', topic);
        this.client.subscribe(topic, (frame) => {
          const payload = JSON.parse(frame.body) as ServerSignal;
          const from = String(payload.fromUserId ?? '');
          const to = payload.targetUserId != null ? String(payload.targetUserId) : undefined;

          if (payload.type === 'OFFER' && payload.sdp) {
            this.onSignal({ type: 'offer', fromUserId: from, toUserId: to, sdp: payload.sdp });
          } else if (payload.type === 'ANSWER' && payload.sdp) {
            this.onSignal({ type: 'answer', fromUserId: from, toUserId: to, sdp: payload.sdp });
          } else if (payload.type === 'ICE_CANDIDATE' && payload.candidate) {
            this.onSignal({ type: 'ice', fromUserId: from, toUserId: to, candidate: payload.candidate });
          } else if (payload.type === 'ERROR') {
            console.warn('[webrtc:error]', payload.error);
          }
        });

        this.flushQueue();
      },

      onDisconnect: () => {
        this.connected = false;
        console.warn('[STOMP] disconnected');
      },

      onStompError: (frame) => {
        this.connected = false;
        console.error('[STOMP ERROR]', frame.headers['message'], frame.body);
      },

      onWebSocketClose: () => {
        this.connected = false;
        console.warn('[STOMP] websocket closed; will try to reconnect');
      },

      onWebSocketError: (e) => {
        this.connected = false;
        console.error('[STOMP] websocket error', e);
>>>>>>> 7b9b1ce (브랜치 최신화)
      },
    });

    // Fast Refresh/마운트 타이밍 문제 방지
    setTimeout(() => this.client.activate(), 0);
  }

  isConnected() {
    return this.connected && this.client.connected;
  }

  /* ------------------------------- 수신 처리부 ------------------------------- */
  private handleFrame(frame: IMessage, src: 'userQ' | 'room') {
    const payload = safeJsonParse<ServerSignal>(frame.body);
    if (!payload) {
      console.error('[STOMP] parse error (invalid JSON)', frame.body);
      return;
    }

    console.log(`[STOMP][${src}] <-`, payload);

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

    if (isServerError(payload)) {
      console.warn('[STOMP] error payload', payload);
      return;
    }

    console.warn('[STOMP] unknown payload', payload);
  }

  /* -------------------------------- 발신 유틸 -------------------------------- */
  private pub<T extends object>(dest: string, body: T) {
    console.log('[STOMP] ->', dest, body);
    this.client.publish({ destination: dest, body: JSON.stringify(body) });
  }

  /** WebRTC 시그널 전송 (offer/answer/ice) */
  sendSignal(signal: WebRTCSignal) {
<<<<<<< HEAD
    const roomIdNum = toNumericId(this.roomId);
    const targetIdNum = signal.toUserId ? toNumericId(signal.toUserId) : undefined;
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
=======
    // 항상 먼저 로그
    console.log('[SIG->]', signal.type, {
      to: signal.toUserId,
      room: this.roomId,
      payload: signal,
    });

    if (!this.isConnected()) {
      this.outboundQueue.push(signal);
      console.warn('[STOMP] not connected; queued:', signal.type);
      return;
    }

    // roomId, targetUserId 그대로 사용
    const roomIdVal = this.roomId;
    const targetIdVal = signal.toUserId;

    if (signal.type === 'offer' || signal.type === 'answer') {
      this.client.publish({
        destination: signal.type === 'offer' ? '/app/webrtc/offer' : '/app/webrtc/answer',
        body: JSON.stringify({
          roomId: roomIdVal,
          targetUserId: targetIdVal,
          sdp: signal.sdp,
          mediaType: 'VIDEO',
        }),
      });
    } else if (signal.type === 'ice') {
      this.client.publish({
        destination: '/app/webrtc/ice-candidate',
        body: JSON.stringify({
          roomId: roomIdVal,
          targetUserId: targetIdVal,
          candidate: signal.candidate,
          sdpMid: signal.candidate?.sdpMid ?? null,
          sdpMLineIndex: signal.candidate?.sdpMLineIndex ?? null,
        }),
>>>>>>> 7b9b1ce (브랜치 최신화)
      });
    }
  }

<<<<<<< HEAD
  /** 내 미디어 상태 브로드캐스트 */
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
=======
  private flushQueue() {
    if (!this.isConnected() || this.outboundQueue.length === 0) return;
    const queued = [...this.outboundQueue];
    this.outboundQueue.length = 0;
    console.log('[STOMP] flushing queued signals:', queued.length);
    queued.forEach((s) => this.sendSignal(s));
>>>>>>> 7b9b1ce (브랜치 최신화)
  }

  disconnect() {
    this.connected = false;
    this.outboundQueue.length = 0;
    this.client.deactivate();
  }
}
