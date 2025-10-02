'use client';

import Button from '@/components/Button';
import ChatWindow, { ChatMsg } from '@/components/study-room/chatting/ChatWindow';
import { useCallback, useMemo, useRef, useState } from 'react';

function ChatRoomContainer() {
  /* !! 채팅 테스트용 임시 mock data 생성 */
  const idRef = useRef(0);
  const uid = useCallback((p = 'm') => `${p}${++idRef.current}`, []);

  const makeSeed = useCallback((): { messages: ChatMsg[]; lastReadAt: number } => {
    const now = Date.now();
    const t = (min: number) => now - min * 60_000; // N분 전

    const msgs: ChatMsg[] = [
      { id: uid(), from: 'other', content: '안녕하세요! 반가워요 😺', createdAt: t(5) },
      { id: uid(), from: 'me', content: '안녕하세요, 채팅 UI 테스트 중이에요.', createdAt: t(4.8) },
      {
        id: uid(),
        from: 'other',
        content: '스크롤/읽음선 잘 보이는지 확인해볼게요.',
        createdAt: t(4.5),
      },
      {
        id: uid(),
        from: 'me',
        content: '좋아요! 새 메시지도 몇 개 보내주세요.',
        createdAt: t(4.2),
      },
      { id: uid(), from: 'other', content: '지금 하나 보냈고요…', createdAt: t(3.9) },
      { id: uid(), from: 'other', content: '두 개째 보냅니다!', createdAt: t(3.6) },
      { id: uid(), from: 'me', content: '확인 완료 🙌', createdAt: t(3.3) },
      { id: uid(), from: 'other', content: '읽음선이 어디 생기는지 봐주세요.', createdAt: t(3.0) },
      {
        id: uid(),
        from: 'other',
        content:
          '길이가 조금 긴 메시지를 보내 레이아웃 확인 중입니다. 말풍선 더보기/접기 버튼도 떠야 합니다. 길이가 조금 긴 메시지를 보내 레이아웃 확인 중입니다. 말풍선 더보기/접기 버튼도 떠야 합니다.',
        createdAt: t(2.5),
      },
    ];

    // 예시: 4번째 메시지까지 읽은 상태(= 그 시각 이후는 미읽음)
    const lastReadAt = msgs[3].createdAt ?? now;
    return { messages: msgs, lastReadAt };
  }, [uid]);

  const [chatOpen, setChatOpen] = useState(false);
  const seed = useMemo(() => makeSeed(), [makeSeed]);
  const [messages, setMessages] = useState<ChatMsg[]>(seed.messages);
  const [lastReadAt, setLastReadAt] = useState<number>(seed.lastReadAt);
  const handleSend = (text: string) => {
    const msg: ChatMsg = {
      id: uid('me-'),
      from: 'me',
      content: text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
  };
  const simulateIncoming = () => {
    const samples = [
      '방금 새 메시지 도착!',
      '길이가 조금 긴 메시지를 보내 레이아웃 확인 중입니다. 말풍선 더보기/접기 버튼도 떠야 합니다. 길이가 조금 긴 메시지를 보내 레이아웃 확인 중입니다. 말풍선 더보기/접기 버튼도 떠야 합니다.',
      '토스트가 잘 떠요?',
      '이제 거의 다 된 것 같네요 :)',
    ];
    const text = samples[Math.floor(Math.random() * samples.length)];
    const msg: ChatMsg = {
      id: uid('other-'),
      from: 'other',
      content: text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
  };
  const handleMarkRead = ({ lastReadAt: at }: { lastReadAt: number }) => {
    setLastReadAt((prev) => (at > prev ? at : prev));
  };

  return (
    <div className="flex flex-col gap-2">
      <Button className="mx-auto" onClick={() => setChatOpen(true)}>
        채팅방
      </Button>
      <Button color="secondary" borderType="outline" size="sm" onClick={simulateIncoming}>
        새 메시지 수신
      </Button>
      {chatOpen && (
        <ChatWindow
          open={chatOpen}
          onToggleOpen={() => setChatOpen((prev) => !prev)}
          messages={messages}
          onSend={handleSend}
          lastReadAt={lastReadAt}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}
export default ChatRoomContainer;
