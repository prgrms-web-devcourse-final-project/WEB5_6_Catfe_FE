'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import useEscapeKey from '@/hook/useEscapeKey';
import UserProfileModal from '@/components/study-room/UserProfileModal';
import TimerPanel from '@/components/study-room/timer/TimerPanel';
import { leaveRoom } from '@/api/apiRooms';
import showToast from '@/utils/showToast';
import type { Role } from '@/@types/rooms';
import { toAvatarId, type AvatarId } from '@/utils/avatar';
import AvatarImage from '@/components/AvatarImage';

type Props = {
  roomId: number;
  className?: string;
  role: Role;
  onOpenSettings?: () => void;
  onOpenTimer?: () => void;
  onOpenChat?: () => void;
  onOpenPlanner?: () => void;
  onOpenProfile?: () => void;
  onOpenUsers?: () => void;
  onOpenInvite?: () => void;
  unreadCount: number;
};

export default function Sidebar({
  roomId,
  className,
  role,
  onOpenSettings,
  onOpenTimer,
  onOpenChat,
  onOpenPlanner,
  onOpenProfile,
  unreadCount,
}: Props) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [avatarId, setAvatarId] = useState<AvatarId>(1);

  const profileAnchorRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEscapeKey(profileOpen, () => setProfileOpen(false));
  useEscapeKey(timerOpen, () => setTimerOpen(false));

  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (profileAnchorRef.current && !profileAnchorRef.current.contains(t)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [profileOpen]);

  useEffect(() => {
    if (!timerOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sidebarRef.current && !sidebarRef.current.contains(t)) {
        setTimerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [timerOpen]);

  const toggleProfile = () => {
    setProfileOpen((v) => !v);
    onOpenProfile?.();
  };

  const toggleTimer = () => {
    setTimerOpen((v) => !v);
    onOpenTimer?.();
  };

  const handleLeave = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await leaveRoom(roomId);
      showToast('success', '방 퇴장 완료');
      router.back();
    } catch (error) {
      let message = '방 퇴장에 실패했어요.';
      if (error instanceof Error && error.message) message = error.message;
      showToast('error', message);
      setLeaving(false);
    }
  };

  const canManage = role === 'HOST';

  return (
    <aside
      ref={sidebarRef}
      className={clsx(
        'relative h-screen w-[10vw] max-w-[70px] border-r border-black/10 flex flex-col items-center justify-between py-4 bg-background-white',
        className
      )}
      aria-label="Room sidebar"
    >
      <button
        className={clsx('rounded-full p-2 cursor-pointer hover:bg-black/5', leaving && 'opacity-60 cursor-not-allowed')}
        aria-label="뒤로가기"
        onClick={handleLeave}
        disabled={leaving}
        aria-busy={leaving}
      >
        <Image src="/icon/study-room/exit.svg" alt="뒤로가기 아이콘" width={20} height={20} />
      </button>

      <div className="flex flex-col items-center justify-center gap-4">
        {canManage && (
          <button className="rounded-full p-2 cursor-pointer hover:bg-black/5" aria-label="설정" onClick={onOpenSettings}>
            <Image src="/icon/study-room/settings.svg" alt="설정 아이콘" width={20} height={20} />
          </button>
        )}

        <div className="relative">
          <button
            className="rounded-full p-2 cursor-pointer hover:bg-black/5"
            aria-label="타이머"
            aria-haspopup="dialog"
            aria-expanded={timerOpen}
            onClick={toggleTimer}
          >
            <Image src="/icon/study-room/clock.svg" alt="타이머 아이콘" width={20} height={20} />
          </button>

          {timerOpen && (
            <div className="absolute -top-20 left-full ml-6 z-50">
              <TimerPanel />
            </div>
          )}
        </div>

        <button
          className="rounded-full p-2 cursor-pointer hover:bg-black/5 relative"
          aria-label="채팅"
          onClick={onOpenChat}
        >
          <Image src="/icon/study-room/chat.svg" alt="채팅 아이콘" width={20} height={20} />
          {unreadCount > 0 && (
            <span className="inline-flex bg-primary-700 text-white rounded-full min-w-5 h-5 items-center justify-center absolute -right-2 top-0">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          className="rounded-full p-2 cursor-pointer hover:bg-black/5"
          aria-label="플래너"
          onClick={onOpenPlanner}
        >
          <Image src="/icon/study-room/planner.svg" alt="플래너 아이콘" width={20} height={20} />
        </button>

        <div className="relative" ref={profileAnchorRef}>
          <button
            className="rounded-full cursor-pointer overflow-hidden w-7 h-7 ring-1 ring-text-secondary"
            aria-label="프로필"
            aria-haspopup="dialog"
            aria-expanded={profileOpen}
            onClick={toggleProfile}
          >
            <AvatarImage id={avatarId} alt="내 프로필" width={28} height={28} />
          </button>

          {profileOpen && (
            <div className="absolute left-full ml-8 bottom-0 z-50">
              <UserProfileModal
                roomId={roomId}
                initialAvatarId={avatarId}
                onAvatarChange={(id) => setAvatarId(toAvatarId(id))}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
