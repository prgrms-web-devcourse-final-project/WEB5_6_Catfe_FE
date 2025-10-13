'use client';

import Image from 'next/image';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import UnreadDivider from './UnreadDivider';
import MessageBubble from './MessageBubble';
import Button from '@/components/Button';
import { ChatMsg } from '@/@types/websocket';

type Mode = 'docked' | 'floating';

interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMsg[];
  onSend?: (text: string) => void;
  lastReadAt?: number;
  onMarkRead?: (payload: { lastReadAt: number; lastReadId: ChatMsg['id'] }) => void;
}
function ChatWindow({ open, onClose, messages, onSend, lastReadAt, onMarkRead }: ChatWindowProps) {
  // container / anchor / bottom ref
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const unreadAnchorRef = useRef<HTMLDivElement | null>(null);

  // 채팅창 모드
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'floating';
    try {
      return (sessionStorage.getItem('chat:mode') as Mode) || 'floating';
    } catch {
      return 'floating';
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('chat:mode', mode);
    } catch {}
  }, [mode]);

  //  입력값 state
  const [draft, setDraft] = useState<string>('');

  // scroll 상태
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [pendingNewCount, setPendingNewCount] = useState<number>(0);

  // 마지막으로 읽은 메시지 ref
  const lastMarkedIdRef = useRef<ChatMsg['id'] | null>(null);

  // message 시간순 정렬 (시간이 같을 경우 id순)
  const ordered = useMemo(
    () =>
      [...messages].sort((a, b) => {
        const ta = a.createdAt ?? 0;
        const tb = b.createdAt ?? 0;
        if (ta !== tb) return ta - tb;
        const ia = String(a.id);
        const ib = String(b.id);
        return ia.localeCompare(ib);
      }),
    [messages]
  );

  // 마지막으로 읽은 부분 찾기
  const firstUnreadIdx = useMemo(() => {
    if (!ordered.length) return -1;
    const base = lastReadAt ?? 0;
    return ordered.findIndex((m) => (m.createdAt ?? 0) > base);
  }, [ordered, lastReadAt]);
  const hasUnread = firstUnreadIdx >= 0;

  // 최신 메시지
  const latest = ordered.length ? ordered[ordered.length - 1] : undefined;

  // scroll Helper (맨 아래로)
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  // scroll Helper (마지막 읽은 위치로 / 없으면 false)
  const scrollToUnreadAnchor = (behavior: ScrollBehavior = 'auto', offset = 12) => {
    const container = scrollRef.current;
    const anchor = unreadAnchorRef.current;
    if (!container || !anchor) return false;

    const cRect = container.getBoundingClientRect();
    const aRect = anchor.getBoundingClientRect();
    const top = container.scrollTop + (aRect.top - cRect.top) - offset;

    container.scrollTo({ top, behavior });
    return true;
  };

  // 채팅방 열면 마지막 읽은 위치로 이동 (없으면 맨 아래)
  useEffect(() => {
    if (!open || ordered.length === 0) return;
    const raf = requestAnimationFrame(() => {
      const hasUnread = scrollToUnreadAnchor('auto');
      if (!hasUnread) scrollToBottom('auto');
    });
    return () => cancelAnimationFrame(raf);
  }, [open, firstUnreadIdx, ordered.length]);

  // 스크롤 위치 추적 + 바닥이면 toast count 초기화
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 16; // px
      const atBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) <= threshold;
      setIsAtBottom(atBottom);
      if (atBottom) setPendingNewCount(0);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // 메시지 수 증가분 계산
  const prevCountRef = useRef(ordered.length);
  useEffect(() => {
    if (!open) {
      prevCountRef.current = ordered.length;
      return;
    }
    if (ordered.length === 0) return;

    const prev = prevCountRef.current;
    const added = Math.max(0, ordered.length - prev);
    prevCountRef.current = ordered.length;

    if (added === 0) return;

    // 내가 보낸 경우 count에서 제외
    const isLatestMine = latest && latest.from === 'ME';

    if ((isAtBottom && !hasUnread) || isLatestMine) {
      scrollToBottom('smooth');
      if (latest && lastMarkedIdRef.current !== latest.id) {
        if ((lastReadAt ?? 0) < (latest.createdAt ?? 0)) {
          onMarkRead?.({ lastReadAt: latest.createdAt ?? Date.now(), lastReadId: latest.id });
          lastMarkedIdRef.current = latest.id;
        }
      }
    } else {
      if (!isLatestMine) setPendingNewCount((n) => n + added);
    }
  }, [ordered, open, isAtBottom, latest, lastReadAt, onMarkRead, hasUnread]);

  // 메시지 전송
  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend?.(text);
    setDraft('');
    requestAnimationFrame(() => scrollToBottom('smooth'));
  };

  console.log({ base: lastReadAt, firstUnreadIdx, latest: latest?.createdAt });

  // toast click -> 마지막 읽은 위치로 이동
  const handleToastClick = () => {
    const jumped = scrollToUnreadAnchor('smooth');
    if (!jumped) scrollToBottom('smooth');
    setPendingNewCount(0);
  };

  const handleClose = () => {
    if (isAtBottom && latest) {
      onMarkRead?.({ lastReadAt: latest.createdAt, lastReadId: latest.id });
    }
    onClose();
  };

  // 패널 크기
  const panelStyle: React.CSSProperties =
    mode === 'floating'
      ? {
          left: 20,
          bottom: 20,
          width: 'max(28dvw, 340px)',
          height: 'min(50dvh, 560px)',
        }
      : {
          top: 0,
          left: 0,
          width: 'min(33dvw, 420px)',
          height: '100dvh',
        };

  if (!open) return;

  return (
    <section
      role="dialog"
      aria-label="채팅"
      aria-modal={false}
      className={[
        'fixed z-50 flex flex-col gap-3 px-3 py-2',
        mode === 'floating'
          ? 'rounded-xl bg-gray-800/40'
          : 'bg-background-white border-r border-zinc-300',
        !open && 'hidden',
      ].join(' ')}
      style={panelStyle}
    >
      {/* Header */}
      <div
        className={[
          'h-10 shrink-0 backdrop-blur flex items-center  pb-2',
          mode === 'floating' ? 'justify-end' : 'justify-between border-b-2 border-zinc-300',
        ].join(' ')}
      >
        <h3 className={['font-semibold', mode === 'floating' ? 'sr-only' : ''].join(' ')}>채팅</h3>
        <div
          className={[
            'flex items-center gap-1',
            mode === 'floating' && 'bg-background-white rounded-lg',
          ].join(' ')}
        >
          <button
            type="button"
            title={mode === 'floating' ? '고정 패널로 전환' : '플로팅으로 전환'}
            aria-label={mode === 'floating' ? '고정 패널로 전환' : '플로팅으로 전환'}
            onClick={() => setMode((m) => (m === 'floating' ? 'docked' : 'floating'))}
            className="cursor-pointer p-1 rounded hover:bg-zinc-100"
          >
            {mode === 'floating' ? (
              <Image
                src="/icon/study-room/expand.svg"
                alt=""
                width={20}
                height={20}
                unoptimized
                priority={false}
              />
            ) : (
              <Image
                src="/icon/study-room/shrink.svg"
                alt=""
                width={20}
                height={20}
                unoptimized
                priority={false}
              />
            )}
          </button>
          <span className="text-zinc-400">|</span>
          <button
            type="button"
            aria-label="닫기"
            onClick={handleClose}
            className="cursor-pointer p-1 rounded hover:bg-zinc-100"
          >
            <Image
              src="/icon/study-room/close.svg"
              alt=""
              width={20}
              height={20}
              unoptimized
              priority={false}
            />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3">
        {ordered.map((m, i) => (
          <Fragment key={m.id}>
            {i === firstUnreadIdx && i >= 0 && (
              <>
                <div ref={unreadAnchorRef} data-anchor="unread">
                  <UnreadDivider />
                </div>
              </>
            )}
            <MessageBubble mine={m.from === 'ME'}>{m.content}</MessageBubble>
          </Fragment>
        ))}
        <div ref={endRef} />
      </div>

      {/* New Message Toast */}
      {pendingNewCount > 0 && !isAtBottom && (
        <Button
          size="sm"
          className="rounded-full absolute left-1/2 -translate-x-1/2 bottom-16 px-3 py-1.5 shadow text-xs font-medium whitespace-nowrap"
          onClick={handleToastClick}
          aria-live="polite"
        >
          새로운 메시지 {pendingNewCount}건 ↓
        </Button>
      )}

      {/* Input */}
      <form
        className="w-full shrink-0 flex items-center gap-2 border-t-2 border-zinc-300 pt-3 pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <label htmlFor="chatting" className="sr-only">
          채팅 입력
        </label>
        <input
          type="text"
          id="chatting"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={[
            'flex-1 h-9 rounded-xl border-2 border-zinc-300 px-3 outline-none focus:ring focus:ring-secondary-400 text-sm  w-3/4',
            mode === 'floating' ? 'bg-background-white' : '',
          ].join(' ')}
          placeholder="채팅을 입력해 주세요"
          aria-label="채팅 입력"
        />
        <button
          type="submit"
          className="size-8 rounded-xl hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center cursor-pointer bg-secondary-300"
          disabled={!draft.trim()}
        >
          <Image
            src="/icon/study-room/send-msg.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
            priority={false}
          />
        </button>
      </form>
    </section>
  );
}
export default ChatWindow;
