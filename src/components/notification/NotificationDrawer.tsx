'use client';

import { useNotifications } from '@/store/useNotifications';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import NotificationRow from './NotificationRow';
import { MOCK_ASIDE_NOTIFICATIONS } from '@/lib/mockNoti';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  mode?: 'aside' | 'page';
}

function NotificationDrawer({ open, onClose, mode = 'aside' }: NotificationDrawerProps) {
  const { listQuery, markRead, markAllRead } = useNotifications();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const items = useMemo(
    () => listQuery.data?.pages.flatMap((p) => p.items) ?? MOCK_ASIDE_NOTIFICATIONS,
    [listQuery]
  );
  const unreadCount = items.filter((i) => i.unread).length;
  const visible = useMemo(() => {
    if (tab === 'unread') return items.filter((item) => item.unread);
    return items;
  }, [items, tab]);

  // open -> focus, esc eventlistner
  useEffect(() => {
    if (!open) return;
    // dialog open 시 focus
    const raf = requestAnimationFrame(() => {
      dialogRef.current?.focus({ preventScroll: true });
    });

    // ESC로 닫기
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
    };
  }, [open, onClose]);

  // Infinite Scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage)
        listQuery.fetchNextPage();
    });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [listQuery]);

  return (
    <div
      role="dialog"
      aria-modal={true}
      aria-labelledby={titleId}
      ref={dialogRef}
      tabIndex={-1}
      className="fixed right-0 top-0 z-50 h-dvh w-1/3 max-w-[350px] bg-secondary-50 shadow-2xl outline-none flex flex-col"
    >
      {/* header */}
      <div className="flex items-center justify-between border-none p-4">
        <h2 id={titleId} className="text-lg font-semibold text-text-secondary">
          Notifications
        </h2>
        <button
          className="inline-flex items-center border-none text-xs text-primary-500"
          onClick={() => markAllRead.mutate()}
        >
          모두 읽음으로 표시
        </button>
      </div>

      {/* Tab */}
      <div className="flex items-center gap-4 px-4 pt-2">
        <button
          className={[
            'flex gap-1 pb-2 border-b-4 text-sm rounded',
            tab === 'all' ? ' border-primary-500' : 'border-secondary-50',
          ].join(' ')}
          onClick={() => setTab('all')}
        >
          전체
          <span className="block px-2 py-1 rounded-full bg-primary-100 text-xs text-text-secondary">
            {unreadCount}
          </span>
        </button>
        <button
          className={[
            'flex gap-1 pb-2 border-b-4 text-sm rounded',
            tab === 'unread' ? ' border-primary-500' : 'border-secondary-50',
          ].join(' ')}
          onClick={() => setTab('unread')}
        >
          읽지 않은 알림
          <span className="block px-2 py-1 rounded-full bg-primary-100 text-xs text-text-secondary">
            {unreadCount}
          </span>
        </button>
      </div>

      {/* list */}
      <ol className="mt-3 overflow-y-auto flex-1">
        {listQuery.isLoading ? (
          <div className="px-6 py-12 text-center text-text-secondary">불러오는 중...</div>
        ) : visible.length === 0 ? (
          <div className="px-6 py-12 text-center text-text-secondary">표시할 알림이 없습니다.</div>
        ) : (
          visible.map((item) => (
            <NotificationRow key={item.id} item={item} onRead={(id) => markRead.mutate(id)} />
          ))
        )}
        {mode === 'page' && <div ref={sentinelRef} className="h-10" />}
      </ol>

      {/* footer */}
      <div className="border-t border-secondary-200 p-4 text-center">
        <button className="text-sm text-primary-500 hover:underline">전체 알림 보기</button>
      </div>
    </div>
  );
}
export default NotificationDrawer;
