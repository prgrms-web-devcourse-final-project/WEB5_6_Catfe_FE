'use client';

import { Client, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const HTTP_URL = process.env.NEXT_PUBLIC_SIGNALING_URL ?? 'http://localhost:8080/ws';

let client: Client | null = null;
let connected = false;
let connecting = false;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function connectRoomSocket(): Promise<Client> {
  if (client && connected) return client;
  if (connecting) {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (connected && client) resolve(client);
        else if (!connecting) reject(new Error('이전 연결 시도가 실패함'));
        else setTimeout(check, 100);
      };
      check();
    });
  }

  const token = getToken();
  if (!token) throw new Error('로그인이 필요합니다.');

  connecting = true;

  return new Promise((resolve, reject) => {
    client = new Client({
      webSocketFactory: () => new SockJS(HTTP_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 0,
      debug: () => {},

      onConnect: () => {
        connected = true;
        connecting = false;
        resolve(client!);
      },

      onStompError: (frame: IFrame) => {
        connected = false;
        connecting = false;
        reject(new Error(frame.headers['message'] ?? 'STOMP error'));
      },

      onWebSocketClose: () => {
        connected = false;
        connecting = false;
      },
    });

    client.activate();

    setTimeout(async () => {
      if (!connected) {
        try {
          await client?.deactivate();
        } catch {}
        connecting = false;
        reject(new Error('WebSocket 연결 타임아웃'));
      }
    }, 8000);
  });
}
