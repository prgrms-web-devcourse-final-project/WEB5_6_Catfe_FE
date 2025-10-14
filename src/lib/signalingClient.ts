import { Client, IMessage, IFrame, IStompSocket } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '@/utils/authToken';
import type { WebRTCSignal } from '@/lib/types';


type ServerOfferAnswer = {
  type: 'OFFER' | 'ANSWER';
  fromUserId: number | string;
  targetUserId?: number | string;
  roomId?: number;
  sdp: string | RTCSessionDescriptionInit;
  sdpType?: 'offer' | 'answer' | 'OFFER' | 'ANSWER';
  mediaType?: 'VIDEO' | 'AUDIO' | 'SCREEN';
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
  type: 'MEDIA_STATE_CHANGE';
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
/** 방 이벤트 */
type UserJoinedEvent = {
  type: 'USER_JOINED';
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  avatarId: number | null;
};
type UserLeftEvent = {
  type: 'USER_LEFT';
  userId: number;
};
/** 외부로 내보낼 방 이벤트 타입 */
export type RoomEvent =
  | { type: 'USER_JOINED'; payload: UserJoinedEvent }
  | { type: 'USER_LEFT'; payload: UserLeftEvent };

type ServerSignal =
  | ServerOfferAnswer
  | ServerIce
  | ServerMediaState
  | ServerError
  | UserJoinedEvent
  | UserLeftEvent;

/** 유틸 & 타입 가드 */
export type MediaState = { micOn: boolean; camOn: boolean; shareOn: boolean };
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
  const anyp = p as unknown as Record<string, unknown>;
  const ok =
    ('mediaType' in anyp) &&
    (anyp['mediaType'] === 'AUDIO' || anyp['mediaType'] === 'VIDEO' || anyp['mediaType'] === 'SCREEN') &&
    (typeof anyp['enabled'] === 'boolean') &&
    (('userId' in anyp) || ('fromUserId' in anyp));
  return (anyp['type'] === 'MEDIA_STATE_CHANGE') || ok;
}
function isServerError(p: ServerSignal): p is ServerError {
  return p.type === 'ERROR';
}
function isUserJoined(p: ServerSignal): p is UserJoinedEvent { return p.type === 'USER_JOINED'; }
function isUserLeft(p: ServerSignal): p is UserLeftEvent { return p.type === 'USER_LEFT'; }

const DEBUG = process.env.NODE_ENV !== 'production';
const dlog = (...a: unknown[]) => { if (DEBUG) console.log('[STOMP]', ...a); };

export default class SignalingClient {
  private client: Client;
  private _ready = false;
  private retryCount = 0;
  private readonly MAX_RETRY = 5;
  private stoppedByAuthError = false;
  private activated = false;

  /** 조인 가드 & webrtc 전송 큐 */
  private joinedOk = false;
  private joinedResolvers: Array<() => void> = [];
  private outbox: Array<{ dest: string; body: object }> = [];
  private readonly OUTBOX_MAX = 50;

  get ready() { return this._ready; }
  get isReady() { return this._ready; }

  /** 리스너 */
  private signalListeners = new Set<(s: WebRTCSignal) => void>();
  private mediaStateListeners = new Set<(userId: string, state: ServerMediaState) => void>();
  private roomEventListeners = new Set<(event: RoomEvent) => void>();

  constructor(
    private roomId: string,
    private userId: string,
    private onReady?: () => void,
    private onAuthError?: (reason?: string) => void,
  ) {
    const RAW_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:8080/ws';
    const token = (getAccessToken() || '').replace(/^Bearer\s+/i, '');
    const urlWithToken = token ? `${RAW_URL}?access_token=${encodeURIComponent(token)}` : RAW_URL;

    this.client = new Client({
      webSocketFactory: () => new SockJS(urlWithToken) as unknown as IStompSocket,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: DEBUG ? (m: string) => dlog(m) : () => {},
      reconnectDelay: 3000,

      onConnect: () => {
        this._ready = true;
        this.retryCount = 0;

        const numRoom = toNumericId(this.roomId);
        this.client.subscribe(`/user/queue/errors`, (f) => this.handleFrame(f, 'errorQ'));
        this.client.subscribe(`/topic/room/${numRoom}/webrtc`, (f) => this.handleFrame(f, 'room-webrtc'));
        this.client.subscribe(`/topic/room/${numRoom}/media-status`, (f) => this.handleFrame(f, 'room-media'));
        this.client.subscribe(`/topic/room/${numRoom}/events`, (f) => this.handleFrame(f, 'room-events'));

        this.joinedOk = false;
        this.outbox = [];
        this.joinRoom();
        this.onReady?.();
      },

      onStompError: (frame: IFrame) => {
        const hdr = frame.headers['message'] ?? '';
        const raw = (hdr + ' ' + frame.body).toLowerCase();
        if (/unauth|un\.auth|auth|인증|token/.test(raw)) this.stopReconnect('auth-error(stomp)');
      },

      onWebSocketError: (e: Event) => {
        dlog('WS error:', (e as { message?: string; type?: string } | undefined)?.message || e.type);
      },
    });

    this.client.onWebSocketClose = (e: CloseEvent) => {
      const reason = (e?.reason || '').toLowerCase();
      if (e?.code === 1008 || /auth|token|인증/.test(reason)) { this.stopReconnect('auth-error(ws-close)'); return; }
      if (this.stoppedByAuthError) return;
      if (this.retryCount >= this.MAX_RETRY) { this.client.reconnectDelay = 0; return; }
      this.retryCount += 1;
      const backoff = Math.min(3000 * 2 ** (this.retryCount - 1), 30000);
      this.client.reconnectDelay = backoff;
    };

    this.activate();
  }

  addSignalListener(l: (s: WebRTCSignal) => void) { this.signalListeners.add(l); }
  removeSignalListener(l: (s: WebRTCSignal) => void) { this.signalListeners.delete(l); }
  addMediaStateListener(l: (userId: string, state: ServerMediaState) => void) { this.mediaStateListeners.add(l); }
  removeMediaStateListener(l: (userId: string, state: ServerMediaState) => void) { this.mediaStateListeners.delete(l); }
  addRoomEventListener(l: (e: RoomEvent) => void) { this.roomEventListeners.add(l); }
  removeRoomEventListener(l: (e: RoomEvent) => void) { this.roomEventListeners.delete(l); }

  private activate() {
    if (this.activated) return;
    this.activated = true;
    this.client.activate();
  }
  private stopReconnect(reason: string) {
    if (this.stoppedByAuthError) return;
    this.stoppedByAuthError = true;
    this.client.reconnectDelay = 0;
    try { this.client.deactivate(); } catch {}
    this._ready = false;
    this.activated = false;
    this.onAuthError?.(reason);
  }

  private resolveJoined() {
    if (this.joinedOk) return;
    this.joinedOk = true;
    this.joinedResolvers.forEach(r => r());
    this.joinedResolvers = [];
    this.flushOutbox();
  }
  private waitUntilJoined(): Promise<void> {
    if (this.joinedOk) return Promise.resolve();
    return new Promise(res => this.joinedResolvers.push(res));
  }
  private enqueue(dest: string, body: object) {
    if (!this.joinedOk && dest.startsWith('/app/webrtc')) {
      if (this.outbox.length >= this.OUTBOX_MAX) this.outbox.shift();
      this.outbox.push({ dest, body });
      return;
    }
    this._publish(dest, body);
  }
  private flushOutbox() {
    if (!this.outbox.length) return;
    const items = [...this.outbox];
    this.outbox = [];
    for (const it of items) this._publish(it.dest, it.body);
  }

  private handleFrame(
    frame: IMessage,
    src: 'errorQ' | 'room-webrtc' | 'room-media' | 'room-events'
  ) {
    const payload = safeJsonParse<ServerSignal>(frame.body);
    if (!payload) return;

    if (isServerError(payload)) {
      const code = payload.error?.code;
      const msg = payload.error?.message || '';
      if (code === 'ROOM_009') setTimeout(() => this.resolveJoined(), 300);
      if (/unauth|auth|인증|token/i.test(msg)) this.stopReconnect('auth-error(server-error)');
      return;
    }

    if (isUserJoined(payload)) { this.roomEventListeners.forEach(cb => cb({ type: 'USER_JOINED', payload })); return; }
    if (isUserLeft(payload))   { this.roomEventListeners.forEach(cb => cb({ type: 'USER_LEFT',   payload })); return; }

    const from =
      'fromUserId' in payload ? String(payload.fromUserId ?? '') :
      ('userId' in payload ? String(payload.userId) : '');
    const to =
      'targetUserId' in payload && payload.targetUserId != null
        ? String(payload.targetUserId)
        : undefined;

    if (src === 'room-webrtc') {
      const myNumericId = toNumericId(this.userId);
      const targetNumericId = to ? toNumericId(to) : null;
      if (targetNumericId !== null && targetNumericId !== myNumericId) return;
    }

    if (isOfferAnswer(payload)) {
      const lowerType = (payload.sdpType?.toString().toLowerCase() as 'offer' | 'answer' | undefined)
        ?? (payload.type === 'OFFER' ? 'offer' : 'answer');
      const remoteSdp: RTCSessionDescriptionInit =
        typeof payload.sdp === 'string' ? { type: lowerType, sdp: payload.sdp } : payload.sdp;
      const signal: WebRTCSignal = { type: payload.type === 'OFFER' ? 'offer' : 'answer', fromUserId: from, toUserId: to, sdp: remoteSdp };
      this.signalListeners.forEach(cb => cb(signal));
      return;
    }

    if (isIce(payload)) {
      const cand = typeof payload.candidate === 'string' ? payload.candidate : payload.candidate.candidate;
      const candInit: RTCIceCandidateInit = {
        candidate: cand, sdpMid: payload.sdpMid ?? null, sdpMLineIndex: payload.sdpMLineIndex ?? null,
      };
      const signal: WebRTCSignal = { type: 'ice', fromUserId: from, toUserId: to, candidate: candInit };
      this.signalListeners.forEach(cb => cb(signal));
      return;
    }

    if (isMediaState(payload)) {
      const anyp = payload as unknown as Record<string, unknown>;
      const normalized: ServerMediaState = {
        type: 'MEDIA_STATE_CHANGE',
        userId: (('userId' in anyp) ? (anyp['userId'] as number | string) : from),
        username: (typeof anyp['username'] === 'string' ? (anyp['username'] as string) : ''),
        mediaType: (anyp['mediaType'] as 'AUDIO' | 'VIDEO' | 'SCREEN'),
        enabled: Boolean(anyp['enabled']),
        timestamp: (typeof anyp['timestamp'] === 'string' ? (anyp['timestamp'] as string) : undefined),
      };
      this.mediaStateListeners.forEach(cb => cb(from, normalized));
    }
  }

  private _publish<T extends object>(dest: string, body: T) {
    if (!this.client.active) return;
    this.client.publish({ destination: dest, body: JSON.stringify(body) });
  }
  private pub<T extends object>(dest: string, body: T) {
    if (dest.startsWith('/app/webrtc')) this.enqueue(dest, body);
    else this._publish(dest, body);
  }

  joinRoom() {
    const roomIdNum = toNumericId(this.roomId);
    const userIdNum = toNumericId(this.userId);
    this.joinedOk = false;
    this.joinedResolvers = [];
    this.outbox = [];
    this._publish(`/app/rooms/${roomIdNum}/join`, { roomId: roomIdNum, userId: userIdNum });
    setTimeout(() => this.resolveJoined(), 500);
  }

  async sendSignal(signal: WebRTCSignal) {
    await this.waitUntilJoined();
    const roomIdNum = toNumericId(this.roomId);
    const targetIdNum = signal.toUserId ? toNumericId(signal.toUserId) : undefined;
    const fromIdNum = toNumericId(this.userId);

    if (signal.type === 'offer' || signal.type === 'answer') {
      const dest = signal.type === 'offer' ? '/app/webrtc/offer' : '/app/webrtc/answer';
      const sdpText = signal.sdp?.sdp ?? '';
      this.pub(dest, { roomId: roomIdNum, fromUserId: fromIdNum, targetUserId: targetIdNum ?? null, sdp: sdpText, mediaType: 'VIDEO' });
      return;
    }

    if (signal.type === 'ice') {
      const c = signal.candidate!;
      this.pub('/app/webrtc/ice-candidate', {
        roomId: roomIdNum,
        fromUserId: fromIdNum,
        targetUserId: targetIdNum ?? null,
        candidate: c.candidate ?? '',
        sdpMid: c.sdpMid ?? null,
        sdpMLineIndex: c.sdpMLineIndex ?? null,
      });
    }
  }

  sendMediaToggle(mediaType: TogglingMediaType, enabled: boolean) {
    this.pub('/app/webrtc/media/toggle', {
      roomId: toNumericId(this.roomId), mediaType, enabled,
    });
  }

  disconnect() {
    this.stoppedByAuthError = true;
    this.client.reconnectDelay = 0;
    this.client.deactivate();
    this._ready = false;
    this.activated = false;
    this.joinedOk = false;
    this.joinedResolvers = [];
    this.outbox = [];
  }
}
