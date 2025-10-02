"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import BigModal from "@/components/study-room/BigModalLayout";
import ModalSideBar from "@/components/study-room/ModalSideBar";
import SettingsGeneral from "./SettingsGeneral";
import SettingsSecurity from "./SettingsSecurity";
import SettingsRoles from "./SettingsRoles";
import SettingsNotice from "./SettingsNotice";
import type { RoomInfo } from "@/@types/room";
import { useRoomStore } from "@/store/room.store";
import { RoomInfoValue } from "../RoomInfo";

export type TabKey = "general" | "security" | "roles" | "notice";

type SidebarItem = {
  key: TabKey;
  label: string;
  iconAct: string;
  iconNon: string;
  disabled?: boolean;
};

const MENUS: SidebarItem[] = [
  { key: "general",  label: "일반",      iconAct: "/icon/study-room/settings.svg", iconNon: "/icon/study-room/settings-non.svg" },
  { key: "security", label: "보안",      iconAct: "/icon/study-room/lock.svg",     iconNon: "/icon/study-room/lock-non.svg" },
  { key: "roles",    label: "멤버 권한", iconAct: "/icon/study-room/profile.svg",  iconNon: "/icon/study-room/profile-non.svg" },
  { key: "notice",   label: "알림",      iconAct: "/icon/study-room/bell.svg",     iconNon: "/icon/study-room/bell-non.svg" },
];

const TITLE: Record<TabKey, string> = {
  general: "일반",
  security: "보안",
  roles: "멤버 권한",
  notice: "알림",
};

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: TabKey;
};

function toRoomInfoValue(i: RoomInfo): RoomInfoValue {
  return {
    title: i.title,
    description: i.description,
    maxMember: i.maxMember,
    isPrivate: i.isPrivate,
    password: i.password ?? null,
    coverPreviewUrl: i.coverPreviewUrl,
    coverUploadFile: null,
    mediaEnabled: i.mediaEnabled,
  };
}

export default function SettingsModal({ open, onClose, defaultTab = "general" }: Props) {
  const [tab, setTab] = useState<TabKey>(defaultTab);

  const info = useRoomStore((s) => s.info);
  const members = useRoomStore((s) => s.members);

  const value: RoomInfoValue | null = useMemo(
    () => (info ? toRoomInfoValue(info) : null),
    [info]
  );

  if (!open) return null;

  const handleChangeTab = (k: string) => setTab(k as TabKey);

  return (
    <BigModal
      open={open}
      onClose={onClose}
      title="스터디룸 설정"
      titleId="settings-modal-title"
      className={clsx("p-0")}
    >
      <BigModal.Body className="p-0 h-[50vh] overflow-hidden">
        {!value ? (
          <div className="p-6 text-sm text-text-secondary">방 정보를 불러오는 중…</div>
        ) : (
          <div className="flex h-full">
            <aside className="w-[220px] shrink-0 bg-secondary-100 rounded-bl-2xl overflow-hidden">
              <ModalSideBar
                items={MENUS}
                value={tab}
                onChange={handleChangeTab}
                width={220}
              />
            </aside>

            <section className="flex-1 px-7 py-5 flex flex-col h-[450px]">
              <h3 className="font-bold text-text-primary mb-6 shrink-0">
                {TITLE[tab]}
              </h3>

              <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
                {tab === "general" && (
                  <SettingsGeneral
                    defaultValue={value}
                    onSave={async (changes, current) => {
                      console.log("PATCH payload:", changes);
                      console.log("현재 스냅샷:", current);
                    }}
                  />
                )}

                {tab === "security" && (
                  <SettingsSecurity
                    defaultValue={{
                      isPrivate: value.isPrivate,
                      password: value.password ?? "",
                    }}
                    onSave={async (changes, current) => {
                      console.log("SECURITY PATCH payload:", changes);
                      console.log("SECURITY current snapshot:", current);
                    }}
                    onDelete={async () => {
                      console.log("ROOM DELETE clicked");
                    }}
                  />
                )}

                {tab === "roles" && (
                  <SettingsRoles
                    defaultUsers={members.map((m) => ({
                      id: m.id,
                      name: m.name,
                      email: m.email,
                      role: m.role,
                      isOwner: m.role === "owner",
                    }))}
                  />
                )}

                {tab === "notice" && (
                  <SettingsNotice
                    defaultValue={{ newNotice: true, newMember: true }}
                    onSave={async (changes, current) => {
                      console.log("NOTICE PATCH:", changes);
                      console.log("NOTICE SNAPSHOT:", current);
                    }}
                  />
                )}
              </div>
            </section>
          </div>
        )}
      </BigModal.Body>
    </BigModal>
  );
}
