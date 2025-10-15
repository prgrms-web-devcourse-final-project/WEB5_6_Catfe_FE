'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Sidebar from '@/components/study-room/page-layout/Sidebar';
import Button from '@/components/Button';
import Image from 'next/image';
import SettingsModal from '@/components/study-room/settings-modal/SettingsModal';
import InviteShareModal from '@/components/study-room/InviteShareModal';
import UsersModal from '@/components/study-room/online-users/UsersModal';
import useEscapeKey from '@/hook/useEscapeKey';
import showToast from '@/utils/showToast';
import { getMyInvite, type InviteMeData } from '@/api/apiRooms';

import { useRoomInfoQuery } from '@/hook/useRoomInfo';
import { useRoomMembersQuery } from '@/hook/useRoomMembers';
import { useUser } from '@/api/apiUsersMe';
import type { Role, UsersListItem } from '@/@types/rooms';
import ChatRoomContainer from './ChatRoomContainer';
import { useChatRoom } from '@/hook/useChatRoom';
import { ApiChatMsg } from '@/@types/websocket';
import { ChatRoomMode } from '@/components/study-room/chatting/ChatWindow';
import { MediaControlsProvider } from '@/contexts/MediaControlsContext';

type Props = {
  children: ReactNode;
  roomId: number;
};

export default function ClientRoomShell({ children, roomId }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatRoomMode>('floating');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteData, setInviteData] = useState<InviteMeData | null>(null);

  const popRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const onChatRoomRef = useRef<((m: ApiChatMsg) => void) | null>(null);

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

  const { data: me } = useUser();

  const users: UsersListItem[] = useMemo(
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

  const myRole: Role = useMemo(() => {
    if (!membersDto) return 'MEMBER';

    let myNumericId: number | null = null;
    if (me && 'id' in me && typeof (me as { id: number }).id === 'number') {
      myNumericId = (me as { id: number }).id;
    } else if (me && 'userId' in me && typeof (me as { userId: number }).userId === 'number') {
      myNumericId = (me as { userId: number }).userId;
    }

    const myNickname =
      me && 'nickname' in me && typeof (me as { nickname?: string }).nickname === 'string'
        ? (me as { nickname?: string }).nickname
        : undefined;

    const mine =
      membersDto.find((m) => myNumericId !== null && Number(m.userId) === myNumericId) ??
      (myNickname ? membersDto.find((m) => m.nickname === myNickname) : undefined);

    return mine?.role ?? 'MEMBER';
  }, [me, membersDto]);

  const canManage = myRole === 'HOST' || myRole === 'SUB_HOST';

  useEscapeKey(inviteOpen, () => setInviteOpen(false));
  useEscapeKey(usersOpen, () => setUsersOpen(false));

  const onClickInvite = async () => {
    if (!infoDto) return;
    try {
      setInviteLoading(true);
      const data = await getMyInvite(infoDto.roomId);
      setInviteData(data);
      setInviteOpen(true);
    } catch (e) {
      showToast('error', (e as Error)?.message || '초대 코드 발급에 실패했어요.');
    } finally {
      setInviteLoading(false);
    }
  };

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

  const onOpenChat = () => setChatOpen(true);
  const onCloseChat = () => setChatOpen(false);

  const usersCount = membersLoading ? '?' : (membersDto?.length ?? 0);

  const chatRoom = useChatRoom(roomId, {
    isOpen: chatOpen,
    onMessage: (m) => onChatRoomRef.current?.(m),
  });

  useEffect(() => {
    if (chatOpen) chatRoom.resetUnread();
  }, [chatOpen, chatRoom]);

  const chatDockWidth = 'min(33dvw, 420px)';
  const gridStyle: React.CSSProperties =
    chatOpen && chatMode === 'docked'
      ? { gridTemplateColumns: `56px ${chatDockWidth} 1fr` }
      : { gridTemplateColumns: '56px 1fr' };

  return (
    <MediaControlsProvider>
    <div className="min-h-screen w-full">
      <div className="grid" style={gridStyle}>
        <Sidebar
          roomId={roomId}
          role={myRole}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenTimer={() => {}}
          onOpenPlanner={() => {}}
          onOpenChat={chatOpen ? onCloseChat : onOpenChat}
          unreadCount={chatRoom.unread}
        />

        {chatOpen && chatMode === 'docked' && <div className="relative" />}

        <div className="relative">
          <header className="flex h-14 items-center justify-end px-6">
            <div className="flex items-center gap-2">
              <div className="relative inline-block" ref={usersRef}>
                <Button
                  size="sm"
                  borderType="outline"
                  color="primary"
                  hasIcon
                  onClick={() => setUsersOpen((v) => !v)}
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
                  <div className="absolute right-0 top-full z-50 mt-2">
                    <UsersModal
                      users={users}
                      canControl={canManage}
                      onClose={() => setUsersOpen(false)}
                    />
                  </div>
                )}
              </div>

              <div className="relative inline-block" ref={popRef}>
                <Button
                  size="sm"
                  borderType="solid"
                  color="primary"
                  onClick={onClickInvite}
                  aria-expanded={inviteOpen}
                  aria-haspopup="dialog"
                  disabled={infoLoading || !infoDto || !!infoError || inviteLoading}
                  title={
                    infoError
                      ? '방 정보 로드 실패'
                      : inviteLoading
                        ? '초대코드를 발급 중입니다...'
                        : undefined
                  }
                >
                  {inviteLoading ? '발급 중...' : '초대하기'}
                </Button>

                {inviteOpen && inviteData && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <InviteShareModal
                      inviteCode={inviteData.inviteCode}
                      inviteLink={inviteData.inviteLink}
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
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        defaultTab="general"
        roomId={roomId}
      />
      <ChatRoomContainer
        roomId={roomId}
        currentUserRole={myRole}
        open={chatOpen}
        onOpen={() => chatRoom.resetUnread()}
        onClose={() => setChatOpen(false)}
        isConnected={chatRoom.isConnected}
        sendChatMessage={chatRoom.sendChatMessage}
        bindOnMessage={(fn) => {
          onChatRoomRef.current = fn;
        }}
        onModeChange={setChatMode}
      />
    </div>
    </MediaControlsProvider>
  );
}
