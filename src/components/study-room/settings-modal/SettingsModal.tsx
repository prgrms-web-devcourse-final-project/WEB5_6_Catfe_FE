'use client';

import { useMemo, useState } from 'react';
import BigModal from '@/components/study-room/BigModalLayout';
import ModalSideBar from '@/components/study-room/ModalSideBar';
import SettingsGeneral from './SettingsGeneral';
import SettingsSecurity from './SettingsSecurity';
import SettingsRoles from './SettingsRoles';
import { useRoomInfoQuery, type RoomDetailDTO } from '@/hook/useRoomInfo';
import { RoomInfoValue } from '../RoomInfo';
import { useRouter } from 'next/navigation';

export type TabKey = 'general' | 'security' | 'roles';

type SidebarItem = {
  key: TabKey;
  label: string;
  iconAct: string;
  iconNon: string;
};

const MENUS: SidebarItem[] = [
  { key: 'general', label: '일반', iconAct: '/icon/study-room/settings.svg', iconNon: '/icon/study-room/settings-non.svg' },
  { key: 'security', label: '보안', iconAct: '/icon/study-room/lock.svg', iconNon: '/icon/study-room/lock-non.svg' },
  { key: 'roles', label: '멤버 권한', iconAct: '/icon/study-room/profile.svg', iconNon: '/icon/study-room/profile-non.svg' },
];

const TITLE: Record<TabKey, string> = {
  general: '일반',
  security: '보안',
  roles: '멤버 권한',
};

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: TabKey;
  roomId: string | number;
};

function toRoomInfoValue(d: RoomDetailDTO): RoomInfoValue {
  return {
    title: d.title,
    description: d.description,
    maxParticipants: d.maxParticipants,
    isPrivate: d.private,
    password: null,
    coverPreviewUrl: null,
    coverUploadFile: null,
    mediaEnabled: d.allowCamera || d.allowAudio || d.allowScreenShare,
  };
}

export default function SettingsModal({ open, onClose, defaultTab = 'general', roomId }: Props) {
  const [tab, setTab] = useState<TabKey>(defaultTab);
  const { data, isLoading, isError, error } = useRoomInfoQuery(roomId, { enabled: open });
  const router = useRouter();

  const roleUsers = useMemo(
    () =>
      (data?.members ?? []).map((m) => ({
        id: String(m.userId),
        name: m.nickname,
        role: m.role,
        isOwner: m.role === 'HOST',
      })),
    [data?.members]
  );

  const value = useMemo(() => (data ? toRoomInfoValue(data) : null), [data]);

  if (!open) return null;

  return (
    <BigModal open={open} onClose={onClose} title="스터디룸 설정" titleId="settings-modal-title" className="p-0">
      <BigModal.Body className="p-0 h-auto overflow-hidden">
        {isLoading && <div className="p-6 text-sm text-text-secondary">방 정보를 불러오는 중…</div>}

        {isError && (
          <div className="p-6 text-sm text-red-500">
            방 정보를 불러오지 못했어요: {error?.message || '알 수 없는 오류'}
          </div>
        )}

        {!isLoading && !isError && data && (
          <div className="flex h-full">
            <aside className="w-[220px] shrink-0 bg-secondary-100 rounded-bl-2xl overflow-hidden">
              <ModalSideBar items={MENUS} value={tab} onChange={(k) => setTab(k as TabKey)} width={220} />
            </aside>

            <section className="flex-1 px-7 py-5 flex flex-col h-[450px]">
              <h3 className="font-bold text-text-primary mb-6 shrink-0">{TITLE[tab]}</h3>

              <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
                {tab === 'general' && value && (
                  <SettingsGeneral roomId={Number(roomId)} defaultValue={value} onSave={async () => {}} />
                )}

                {tab === 'security' && value && (
                  <SettingsSecurity
                    roomId={Number(roomId)}
                    defaultValue={{ isPrivate: value.isPrivate, password: value.password ?? '' }}
                    onSave={async () => {}}
                    onDelete={async () => {
                      onClose?.();
                      router.replace('/');
                      router.refresh();
                    }}
                  />
                )}

                {tab === 'roles' && <SettingsRoles roomId={Number(roomId)} defaultUsers={roleUsers} />}
              </div>
            </section>
          </div>
        )}

        {!isLoading && !isError && !data && (
          <div className="p-6 text-sm text-text-secondary">방 정보가 비어 있어요.</div>
        )}
      </BigModal.Body>
    </BigModal>
  );
}
