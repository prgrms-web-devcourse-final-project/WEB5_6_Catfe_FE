import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WebRTCSignal } from './types';

export class SignalingClient {
  private client: Client;
  private roomId: string;
  private userId: string;
  private onSignal: (signal: WebRTCSignal) => void;

  constructor(roomId: string, userId: string, accessToken: string, onSignal: (signal: WebRTCSignal) => void) {
    this.roomId = roomId;
    this.userId = userId;
    this.onSignal = onSignal;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      debug: (msg) => console.log('[STOMP]', msg),
      onConnect: () => {
        console.log('Signaling connected');
        this.subscribe();
      },
    });

    this.client.activate();
  }

  private subscribe() {
    this.client.subscribe(`/topic/room/${this.roomId}/webrtc`, (message) => {
      const signal: WebRTCSignal = JSON.parse(message.body);
      this.onSignal(signal);
    });
  }

  sendSignal(signal: WebRTCSignal) {
    this.client.publish({
      destination: '/app/webrtc',
      body: JSON.stringify(signal),
    });
  }
}
