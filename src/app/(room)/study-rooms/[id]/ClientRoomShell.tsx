// ClientRoomShell.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "@/components/study-room/page-layout/Sidebar";
import Button from "@/components/Button";
import Image from "next/image";
import SettingsModal from "@/components/study-room/settings-modal/SettingsModal";
import InviteShareModal from "@/components/study-room/InviteShareModal";
import UsersModal from "@/components/study-room/online-users/UsersModal";
import { useRoomStore } from "@/stores/room.store";
import useEscapeKey from "@/hook/useEscapeKey";

type Props = {
  children: ReactNode;
};

export default function ClientRoomShell({children }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  const [usersOpen, setUsersOpen] = useState(false);
  const usersRef = useRef<HTMLDivElement>(null);

  const info = useRoomStore((s) => s.info);
  const users = useRoomStore((s) => s.members);

  const roomUrl = useMemo(() => {
    if (!info) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/study-rooms/${info.id}`;
  }, [info]);

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

  const onOpenSettings = () => setSettingsOpen(true);
  const onCloseSettings = () => setSettingsOpen(false);

  const onOpenTimer = () => console.log("timer open");
  const onOpenNotice = () => console.log("notice open");
  const onOpenChat = () => console.log("chat open");
  const onOpenPlanner = () => console.log("planner open");

  const onToggleUsers = () => setUsersOpen((v) => !v);
  const onToggleInvite = () => setInviteOpen((v) => !v);

  return (
    <div className="min-h-screen w-full">
      <div className="grid grid-cols-[56px_1fr]">
        <Sidebar
          onOpenSettings={onOpenSettings}
          onOpenTimer={onOpenTimer}
          onOpenNotice={onOpenNotice}
          onOpenChat={onOpenChat}
          onOpenPlanner={onOpenPlanner}
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
                >
                  <Image src="/icon/study-room/user.svg" alt="사용자 아이콘" width={16} height={16} />
                  {users.length}
                </Button>

                {usersOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <UsersModal
                      users={users}
                      canControl
                      onClose={() => setUsersOpen(false)}
                    />
                  </div>
                )}
              </div>

              {/* 초대하기 버튼 */}
              <div className="relative inline-block" ref={popRef}>
                <Button
                  size="sm"
                  borderType="solid"
                  color="primary"
                  onClick={onToggleInvite}
                  aria-expanded={inviteOpen}
                  aria-haspopup="dialog"
                >
                  초대하기
                </Button>

                {inviteOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <InviteShareModal
                      roomUrl={roomUrl}
                      password={info?.password ?? undefined}
                      defaultSharePassword={true}
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

      <SettingsModal open={settingsOpen} onClose={onCloseSettings} defaultTab="general" />
    </div>
  );
}
