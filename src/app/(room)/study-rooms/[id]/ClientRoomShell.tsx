'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Sidebar from '@/components/study-room/page-layout/Sidebar';
import Button from '@/components/Button';
import Image from 'next/image';
import SettingsModal from '@/components/study-room/settings-modal/SettingsModal';
import InviteShareModal from '@/components/study-room/InviteShareModal';
import UsersModal from '@/components/study-room/online-users/UsersModal';
import useEscapeKey from '@/hook/useEscapeKey';

import { useRoomInfoQuery } from '@/hook/useRoomInfo';
import { useRoomMembersQuery } from '@/hook/useRoomMembers';
import ChatRoomContainer from './ChatRoomContainer';
import { useChatRoom } from '@/hook/useChatRoom';
import { ApiChatMsg } from '@/@types/websocket';

type Props = {
  children: ReactNode;
  roomId: number;
};

export default function ClientRoomShell({ children, roomId }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const popRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const onChatRoomRef = useRef<((m: ApiChatMsg) => void) | null>(null);

  /* ------------ Room Info & Memeber --------------- */
  const { data: infoDto, error: infoError, isLoading: infoLoading } = useRoomInfoQuery(roomId);

  const {
    data: membersDto,
    isLoading: membersLoading,
    error: membersError,
  } = useRoomMembersQuery(roomId, {
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const users = useMemo(
    () =>
      (membersDto ?? []).map((m) => ({
        id: Number(m.userId),
        name: m.nickname,
        role: m.role,
        avatarUrl: m.profileImageUrl ?? null,
        joinedAt: m.joinedAt ?? null,
      })),
    [membersDto]
  );

  const roomUrl = useMemo(() => {
    if (!infoDto) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/study-rooms/${infoDto.roomId}`;
  }, [infoDto]);

  const maskedPassword = infoDto?.private ? '****' : undefined;

  useEscapeKey(inviteOpen, () => setInviteOpen(false));
  useEscapeKey(usersOpen, () => setUsersOpen(false));

  useEffect(() => {
    if (!inviteOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current && !popRef.current.contains(t)) setInviteOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [inviteOpen]);

  useEffect(() => {
    if (!usersOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (usersRef.current && !usersRef.current.contains(t)) setUsersOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [usersOpen]);

  /* ------------ Sidebar Toggle --------------- */
  const onOpenSettings = () => setSettingsOpen(true);
  const onCloseSettings = () => setSettingsOpen(false);

  const onOpenTimer = () => {};
  // const onOpenNotice = () => {};
  const onOpenChat = () => setChatOpen(true);
  const onCloseChat = () => setChatOpen(false);
  const onOpenPlanner = () => {};

  const onToggleUsers = () => setUsersOpen((v) => !v);
  const onToggleInvite = () => setInviteOpen((v) => !v);

  const usersCount = membersLoading ? '?' : (membersDto?.length ?? 0);

  /* ------------ Chatting --------------- */
  const chatRoom = useChatRoom(roomId, {
    isOpen: chatOpen,
    onMessage: (m) => onChatRoomRef.current?.(m),
  });

  // 채팅창 열면 뱃지 초기화
  useEffect(() => {
    if (chatOpen) chatRoom.resetUnread();
  }, [chatOpen, chatRoom]);

  return (
    <div className="min-h-screen w-full">
      <div className="grid grid-cols-[56px_1fr]">
        <Sidebar
          onOpenSettings={onOpenSettings}
          onOpenTimer={onOpenTimer}
          // onOpenNotice={onOpenNotice}
          onOpenChat={chatOpen ? onCloseChat : onOpenChat}
          onOpenPlanner={onOpenPlanner}
          unreadCount={chatRoom.unread}
        />

        <div className="relative">
          <header className="h-14 flex items-center justify-end px-6">
            <div className="flex items-center gap-2">
              {/* Users */}
              <div className="relative inline-block" ref={usersRef}>
                <Button
                  size="sm"
                  borderType="outline"
                  color="primary"
                  hasIcon
                  onClick={onToggleUsers}
                  aria-expanded={usersOpen}
                  aria-haspopup="dialog"
                  disabled={!!membersError}
                  title={membersError ? '멤버 로드 실패' : undefined}
                >
                  <Image
                    src="/icon/study-room/user.svg"
                    alt="사용자 아이콘"
                    width={16}
                    height={16}
                  />
                  {usersCount}
                </Button>

                {usersOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <UsersModal users={users} canControl onClose={() => setUsersOpen(false)} />
                  </div>
                )}
              </div>

              {/* 초대하기 */}
              <div className="relative inline-block" ref={popRef}>
                <Button
                  size="sm"
                  borderType="solid"
                  color="primary"
                  onClick={onToggleInvite}
                  aria-expanded={inviteOpen}
                  aria-haspopup="dialog"
                  disabled={infoLoading || !infoDto || !!infoError}
                  title={infoError ? '방 정보 로드 실패' : undefined}
                >
                  초대하기
                </Button>

                {inviteOpen && infoDto && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <InviteShareModal
                      roomUrl={roomUrl}
                      password={maskedPassword}
                      defaultSharePassword={!!maskedPassword}
                      onClose={() => setInviteOpen(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="px-6">{children}</main>
        </div>
      </div>

      <ChatRoomContainer
        roomId={roomId}
        open={chatOpen}
        onOpen={() => chatRoom.resetUnread()}
        onClose={() => setChatOpen(false)}
        isConnected={chatRoom.isConnected}
        sendChatMessage={chatRoom.sendChatMessage}
        bindOnMessage={(fn) => {
          onChatRoomRef.current = fn;
        }}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={onCloseSettings}
        defaultTab="general"
        roomId={roomId}
      />
    </div>
  );
}
