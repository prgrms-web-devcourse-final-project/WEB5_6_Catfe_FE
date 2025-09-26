"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "@/components/study-room/page-layout/Sidebar";
import Button from "@/components/Button";
import Image from "next/image";
import SettingsModal from "@/components/study-room/SettingsModal";

type Props = {
  memberCount: number;
  children: ReactNode;
};

export default function ClientRoomShell({ memberCount, children }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const onOpenSettings = () => setSettingsOpen(true);
  const onCloseSettings = () => setSettingsOpen(false);

  const onOpenTimer = () => console.log("timer open");
  const onOpenNotice = () => console.log("notice open");
  const onOpenChat = () => console.log("chat open");
  const onOpenPlanner = () => console.log("planner open");
  const onOpenProfile = () => console.log("profile open");
  const onOpenUsers = () => console.log("users open");
  const onOpenInvite = () => console.log("invite open");

  return (
    <div className="min-h-screen w-full">
      <div className="grid grid-cols-[56px_1fr]">
        <Sidebar
          onOpenSettings={onOpenSettings}
          onOpenTimer={onOpenTimer}
          onOpenNotice={onOpenNotice}
          onOpenChat={onOpenChat}
          onOpenPlanner={onOpenPlanner}
          onOpenProfile={onOpenProfile}
        />

        <div className="relative">
          <header className="h-14 flex items-center justify-end px-6">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                borderType="outline"
                color="primary"
                hasIcon
                onClick={onOpenUsers}
              >
                <Image src="/icon/study-room/user.svg" alt="사용자 아이콘" width={16} height={16} />
                {memberCount}
              </Button>

              <Button
                size="sm"
                borderType="solid"
                color="primary"
                onClick={onOpenInvite}
              >
                초대하기
              </Button>

            </div>
          </header>

          <main className="px-6">{children}</main>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onClose={onCloseSettings} defaultTab="general" />
    </div>
  );
}
