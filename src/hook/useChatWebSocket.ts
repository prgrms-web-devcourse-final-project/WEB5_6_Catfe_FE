'use client';

import { useUser } from '@/api/apiUsersMe';
import { getAccessToken } from '@/utils/authToken';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import { ApiChatMsg } from '@/@types/websocket';
import SockJS from 'sockjs-client';

export const useAuthInfo = () => {
  const accessToken = getAccessToken();
  const { data: user } = useUser();
  const userId = user?.userId || null;

  return { accessToken, userId };
};

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

export function useChatWebSocket(roomId: number, onChatMessage: (message: ApiChatMsg) => void) {
  const { accessToken, userId } = useAuthInfo();
  const [isConnected, setIsConnected] = useState(false);

  const clientRef = useRef<StompJs.Client | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef(userId);
  const onMessageRef = useRef(onChatMessage);

  // Callback & userId 최신화
  useEffect(() => {
    onMessageRef.current = onChatMessage;
  }, [onChatMessage]);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  /* ------ Heartbeat 전송 ------ */
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    heartbeatTimerRef.current = setInterval(() => {
      const client = clientRef.current;
      if (client && client.connected && userIdRef.current) {
        try {
          client.publish({
            destination: '/app/heartbeat',
            body: JSON.stringify({ userId: userIdRef.current }),
          });
        } catch (err) {
          console.error('[Heartbeat] 전송 실패:', err);
        }
      }
    }, HEARTBEAT_INTERVAL_MS);
  }, []);

  /* ------ Heartbeat 중지 ------ */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  /* ------ WebSocket 연결 및 해제 ------ */
  useEffect(() => {
    if (!accessToken || !userId) {
      // 연결된 클라이언트 clean up
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
      stopHeartbeat();

      return;
    }

    // 클라이언트 생성 및 설정
    const client = new StompJs.Client({
      webSocketFactory: () =>
        new SockJS(process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 연결 성공 시 콜백
    client.onConnect = () => {
      setIsConnected(true);
      // Heartbeat 시작
      startHeartbeat();
      // 방 채팅 구독 시작
      client.subscribe(`/topic/room/${roomId}`, (message: StompJs.IMessage) => {
        try {
          const chatMessage: ApiChatMsg = JSON.parse(message.body);
          onChatMessage(chatMessage);
        } catch (err) {
          console.error('수신 메시지 파싱 오류', err);
        }
      });
    };

    // 연결 실패 및 해제 콜백
    client.onStompError = (frame) => {
      console.error('WebSocket STOMP 오류:', frame.headers['message'], frame.body);
      setIsConnected(false);
      stopHeartbeat();
    };

    client.onDisconnect = () => {
      setIsConnected(false);
      stopHeartbeat();
    };

    clientRef.current = client;
    userIdRef.current = userId;

    // 연결 시작
    client.activate();

    // Unmount Clean Up
    return () => {
      stopHeartbeat();
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
    };
  }, [accessToken, userId, roomId, startHeartbeat, stopHeartbeat, onChatMessage]);

  /* ------ 채팅 메시지 전송 ------ */
  const sendChatMessage = useCallback(
    (content: string) => {
      const client = clientRef.current;
      if (!client || !isConnected) {
        console.error('WebSocket이 연결되지 않았습니다.');
        return false;
      }

      try {
        client.publish({
          destination: `/app/chat/room/${roomId}`,
          body: JSON.stringify({
            content,
          }),
        });
        return true;
      } catch (err) {
        console.error('메시지 전송 실패:', err);
        return false;
      }
    },
    [isConnected, roomId]
  );

  return {
    isConnected,
    sendChatMessage,
    currentUserId: userId,
  };
}
