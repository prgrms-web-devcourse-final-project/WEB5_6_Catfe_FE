// src/lib/signalingClient.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '@/utils/authToken';
import type { WebRTCSignal, ServerSignal } from '@/lib/types';

export default class SignalingClient {
  private client: Client;

  constructor(
    private roomId: string,
    private userId: string,
    private onSignal: (s: WebRTCSignal) => void
  ) {
    const WS_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:8080/ws';

    const token = getAccessToken(); // ← localStorage 등에서 실제 토큰
    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {}, // 토큰 없으면 헤더 생략
      debug: (m) => console.log('[STOMP]', m),
      reconnectDelay: 3000,
      onConnect: () => {
        console.log('[STOMP] connected');
        this.client.subscribe(`/topic/room/${this.roomId}/webrtc`, (frame) => {
          const payload = JSON.parse(frame.body) as ServerSignal;
          const from = String(payload.fromUserId ?? '');
          const to =
            payload.targetUserId != null ? String(payload.targetUserId) : undefined;

          if (payload.type === 'OFFER' && payload.sdp) {
            this.onSignal({ type: 'offer', fromUserId: from, toUserId: to, sdp: payload.sdp });
          } else if (payload.type === 'ANSWER' && payload.sdp) {
            this.onSignal({ type: 'answer', fromUserId: from, toUserId: to, sdp: payload.sdp });
          } else if (payload.type === 'ICE_CANDIDATE' && payload.candidate) {
            this.onSignal({
              type: 'ice',
              fromUserId: from,
              toUserId: to,
              candidate: payload.candidate,
            });
          } else if (payload.type === 'ERROR') {
            console.warn('[webrtc:error]', payload.error);
          }
        });
      },
    });

    this.client.activate();
  }

  sendSignal(signal: WebRTCSignal) {
    const roomIdNum = toNumericId(this.roomId);
    const targetIdNum = signal.toUserId ? toNumericId(signal.toUserId) : undefined;

    if (signal.type === 'offer' || signal.type === 'answer') {
      this.client.publish({
        destination: signal.type === 'offer' ? '/app/webrtc/offer' : '/app/webrtc/answer',
        body: JSON.stringify({
          roomId: roomIdNum,
          targetUserId: targetIdNum,
          sdp: signal.sdp,
          mediaType: 'VIDEO',
        }),
      });
    } else if (signal.type === 'ice') {
      this.client.publish({
        destination: '/app/webrtc/ice-candidate',
        body: JSON.stringify({
          roomId: roomIdNum,
          targetUserId: targetIdNum,
          candidate: signal.candidate,
          sdpMid: signal.candidate?.sdpMid ?? null,
          sdpMLineIndex: signal.candidate?.sdpMLineIndex ?? null,
        }),
      });
    }
  }

  disconnect() {
    this.client.deactivate();
  }
}

function toNumericId(input: string): number {
  const part = input.split('-')[1] ?? input; // "room-003" -> "003"
  const n = Number(part);
  return Number.isFinite(n) ? n : 0;
}
