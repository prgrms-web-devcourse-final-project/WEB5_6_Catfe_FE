"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Sidebar from "@/components/study-room/page-layout/Sidebar";
import Button from "@/components/Button";
import Image from "next/image";
import SettingsModal from "@/components/study-room/settings-modal/SettingsModal";
import InviteShareModal from "@/components/study-room/InviteShareModal";
import UsersModal from "@/components/study-room/online-users/UsersModal";
import useEscapeKey from "@/hook/useEscapeKey";

import { useRoomInfoQuery } from "@/hook/useRoomInfo";
import { useRoomMembersQuery } from "@/hook/useRoomMembers";
import { useUser } from "@/api/apiUsersMe";
import type { Role, UsersListItem } from "@/@types/rooms";

type Props = {
  children: ReactNode;
  roomId: number;
};

export default function ClientRoomShell({ children, roomId }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);

  const popRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);

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
    if (!membersDto) return "MEMBER";

    let myNumericId: number | null = null;
    if (me && "id" in me && typeof (me as { id: number }).id === "number") {
      myNumericId = (me as { id: number }).id;
    } else if (me && "userId" in me && typeof (me as { userId: number }).userId === "number") {
      myNumericId = (me as { userId: number }).userId;
    }

    const myNickname =
      me && "nickname" in me && typeof (me as { nickname?: string }).nickname === "string"
        ? (me as { nickname?: string }).nickname
        : undefined;

    const mine =
      membersDto.find((m) => myNumericId !== null && Number(m.userId) === myNumericId) ??
      (myNickname ? membersDto.find((m) => m.nickname === myNickname) : undefined);

    return mine?.role ?? "MEMBER";
  }, [me, membersDto]);

  const canManage = myRole === "HOST" || myRole === "SUB_HOST";

  const roomUrl = useMemo(() => {
    if (!infoDto) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/study-rooms/${infoDto.roomId}`;
  }, [infoDto]);

  const maskedPassword = infoDto?.private ? "****" : undefined;

  useEscapeKey(inviteOpen, () => setInviteOpen(false));
  useEscapeKey(usersOpen, () => setUsersOpen(false));

  useEffect(() => {
    if (!inviteOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current && !popRef.current.contains(t)) setInviteOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [inviteOpen]);

  useEffect(() => {
    if (!usersOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (usersRef.current && !usersRef.current.contains(t)) setUsersOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [usersOpen]);

  const usersCount = membersLoading ? "?" : (membersDto?.length ?? 0);

  return (
    <div className="min-h-screen w-full">
      <div className="grid grid-cols-[56px_1fr]">
        <Sidebar
          roomId={roomId}
          role={myRole}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenTimer={() => {}}
          onOpenChat={() => {}}
          onOpenPlanner={() => {}}
        />

        <div className="relative">
          <header className="h-14 flex items-center justify-end px-6">
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
                  title={membersError ? "멤버 로드 실패" : undefined}
                >
                  <Image src="/icon/study-room/user.svg" alt="사용자 아이콘" width={16} height={16} />
                  {usersCount}
                </Button>

                {usersOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50">
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
                  onClick={() => setInviteOpen((v) => !v)}
                  aria-expanded={inviteOpen}
                  aria-haspopup="dialog"
                  disabled={infoLoading || !infoDto || !!infoError}
                  title={infoError ? "방 정보 로드 실패" : undefined}
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

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} defaultTab="general" roomId={roomId} />
    </div>
  );
}
