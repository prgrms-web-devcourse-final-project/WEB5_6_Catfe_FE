'use client';

import { ApiChatMsg, ChatMsg } from '@/@types/websocket';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatWebSocket } from './useChatWebSocket';

export const mapApiToChatMsg = (apiMsg: ApiChatMsg, currentUserId: number): ChatMsg => {
  return {
    id: apiMsg.messageId,
    from: apiMsg.userId === currentUserId ? 'ME' : 'OTHER',
    content: apiMsg.content,
    createdAt: new Date(apiMsg.createdAt).getTime(),
    userId: apiMsg.userId,
    nickname: apiMsg.nickname,
    profileImageUrl: apiMsg.profileImageUrl,
  };
};

export type ChatRoomOptions = {
  isOpen: boolean;
  onMessage?: (msg: ApiChatMsg) => void;
};
export function useChatRoom(roomId: number, { isOpen, onMessage }: ChatRoomOptions) {
  const [unread, setUnread] = useState(0);
  const isOpenRef = useRef(isOpen);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const handleIncoming = useCallback((apiMsg: ApiChatMsg) => {
    // 채팅창이 열려있으면 컨테이너에 전달
    if (isOpenRef.current) {
      onMessageRef.current?.(apiMsg);
      return;
    }
    // 닫혀있으면 뱃지++
    setUnread((prev) => prev + 1);
  }, []);

  const { isConnected, sendChatMessage } = useChatWebSocket(roomId, handleIncoming);
  const resetUnread = useCallback(() => setUnread(0), []);

  return { isConnected, sendChatMessage, unread, resetUnread };
}
