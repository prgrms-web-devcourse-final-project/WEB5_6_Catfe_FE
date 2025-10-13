'use client';

import { ApiChatMsg, ChatMsg } from '@/@types/websocket';
import ChatWindow from '@/components/study-room/chatting/ChatWindow';
import { mapApiToChatMsg } from '@/hook/useChatRoom';
import { useAuthInfo } from '@/hook/useChatWebSocket';
import api from '@/utils/api';
import showToast from '@/utils/showToast';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ChatRoomContainerProps {
  roomId: number;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  isConnected: boolean;
  sendChatMessage: (text: string) => boolean;
  bindOnMessage: (fn: (msg: ApiChatMsg) => void) => void;
}

function ChatRoomContainer({
  roomId,
  open,
  onOpen,
  onClose,
  isConnected,
  sendChatMessage,
  bindOnMessage,
}: ChatRoomContainerProps) {
  const { userId: currentUserId } = useAuthInfo();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [lastReadAt, setLastReadAt] = useState<number>(0);

  // Websocket 연결 중 중복 데이터 방지
  const seenMessages = useRef<Set<ChatMsg['id']>>(new Set());
  const pushIfNew = useCallback((msg: ChatMsg) => {
    if (seenMessages.current.has(msg.id)) return;
    seenMessages.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  }, []);

  // 채팅창 열면 history 로드 + 뱃지 0 + 읽음 기준 갱신
  useEffect(() => {
    if (!open || !isConnected || !currentUserId) return;
    let abort = false;

    const fetchInitialMessage = async () => {
      if (abort) return;
      try {
        const { data: response } = await api.get(`api/rooms/${roomId}/messages?size=50`);
        if (response.success) {
          const apiMessages: ApiChatMsg[] = response.data.content;
          apiMessages.forEach((message) => seenMessages.current.add(message.messageId));
          const mappedMessages = apiMessages.map((apiMessage) =>
            mapApiToChatMsg(apiMessage, currentUserId ?? 0)
          );
          setMessages(mappedMessages);
          onOpen();
        }
      } catch (err) {
        console.error('채팅 기록 로드 실패:', err);
        showToast('error', '채팅 기록 불러오기에 실패했습니다.');
      }
    };

    fetchInitialMessage();

    return () => {
      abort = true;
    };
  }, [open, isConnected, roomId, currentUserId, onOpen]);

  useEffect(() => {
    if (!open) return;
    const handler = (apiRes: ApiChatMsg) => pushIfNew(mapApiToChatMsg(apiRes, currentUserId ?? 0));
    bindOnMessage(handler);
    return () => bindOnMessage(() => {});
  }, [open, currentUserId, bindOnMessage, pushIfNew]);

  const handleSend = (text: string) => {
    if (!isConnected) {
      console.error('WebSocket 연결 실패: 메시지 전송 불가');
      showToast('error', '메시지 전송에 실패했습니다.');
      return;
    }
    const success = sendChatMessage(text);
    if (!success) {
      console.error('STOMP Publish 오류: 메시지 전송 불가');
      showToast('error', '메시지 전송에 실패했습니다.');
      return;
    }
  };

  const handleMarkRead = ({ lastReadAt }: { lastReadAt: number }) => {
    setLastReadAt((prev) => (lastReadAt > prev ? lastReadAt : prev));
  };

  return (
    <ChatWindow
      open={open}
      onClose={onClose}
      messages={messages}
      onSend={handleSend}
      lastReadAt={lastReadAt}
      onMarkRead={handleMarkRead}
    />
  );
}
export default ChatRoomContainer;
