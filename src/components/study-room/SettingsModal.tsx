"use client";

import { useState } from "react";
import clsx from "clsx";
import BigModal from "@/components/study-room/BigModalLayout";
import ModalSideBar from "@/components/study-room/ModalSideBar";
import SettingsGeneral from "@/components/study-room/SettingsGeneral";
import SettingsSecurity from "@/components/study-room/SettingsSecurity";
import SettingsRoles from "@/components/study-room/SettingsRoles";
import SettingsNotice from "@/components/study-room/SettingsNotice";
import { RoomInfoValue } from "./RoomInfo";

export type TabKey = "general" | "security" | "roles" | "notice";

const MENUS = [
  { key: "general", label: "일반", iconAct: "/icon/study-room/settings.svg", iconNon: "/icon/study-room/settings-non.svg" },
  { key: "security", label: "보안", iconAct: "/icon/study-room/lock.svg", iconNon: "/icon/study-room/lock-non.svg" },
  { key: "roles", label: "멤버 권한", iconAct: "/icon/study-room/profile.svg", iconNon: "/icon/study-room/profile-non.svg" },
  { key: "notice", label: "알림", iconAct: "/icon/study-room/bell.svg", iconNon: "/icon/study-room/bell-non.svg" },
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

export default function SettingsModal({ open, onClose, defaultTab = "general" }: Props) {
  const [tab, setTab] = useState<TabKey>(defaultTab);
  if (!open) return null;

  const dummyRoom: RoomInfoValue = {
  title: "고양이 연구실",
  description: "냥냥펀치 연구와 잡담하는 공간",
  maxMember: 5,
  isPrivate: false,
  password: null,
  coverPreviewUrl: null,
  coverUploadFile: null,
  mediaEnabled: false,
};

  return (
    <BigModal
      open={open}
      onClose={onClose}
      title="스터디룸 설정"
      titleId="settings-modal-title"
      className={clsx("p-0")}
    >
      <BigModal.Body className="p-0 h-[50vh] overflow-hidden">
        <div className="flex h-full">
          <aside className="w-[220px] shrink-0 bg-secondary-100 rounded-bl-2xl overflow-hidden">
            <ModalSideBar
              items={MENUS}
              value={tab}
              onChange={(k) => setTab(k as TabKey)}
              width={220}
            />
          </aside>

          <section className="flex-1 px-7 py-5 flex flex-col h-[450px]">
            <h3 className="font-bold text-text-primary mb-6 shrink-0">{TITLE[tab]}</h3>
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
              {tab === "general"  && <SettingsGeneral defaultValue={dummyRoom} onSave={async (changes, current) => {
                // PATCH payload로 changes만 전송
                console.log("PATCH payload:", changes);
                console.log("현재 스냅샷:", current);
              }} />}
              {tab === "security" && (
                <SettingsSecurity
                  defaultValue={{
                    isPrivate: dummyRoom.isPrivate,
                    password: dummyRoom.password ?? "",
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
              {tab === "roles"    && (
                <SettingsRoles
                  defaultUsers={[
                    { id: "1", name: "김유하", email: "yooha@example.com", role: "member", isOwner: true },
                    { id: "2", name: "민지",   email: "minji@example.com",  role: "staff" },
                  ]}
                  onSave={async (patch, current) => {
                    // patch: { added: User[], removed: string[], updated: { id, role }[] }
                    console.log("PATCH:", patch);
                    console.log("SNAPSHOT:", current);
                  }}
                />
              )}
              {tab === "notice" && (
                <SettingsNotice
                  defaultValue={{ newNotice: true, newMember: true }}
                  onSave={async (changes, current) => {
                    // 변경만 PATCH
                    console.log("NOTICE PATCH:", changes);
                    console.log("NOTICE SNAPSHOT:", current);
                  }}
                />
              )}
            </div>
          </section>
        </div>
      </BigModal.Body>
    </BigModal>
  );
}
