'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import CustomSelect from '@/components/CustomSelect';
import Button from '@/components/Button';
import HostBadge from '../HostBadge';
import showToast from '@/utils/showToast';
import { useBatchRoleSave } from '@/hook/useBatchRoleSave';
import { useRoomMembersQuery } from '@/hook/useRoomMembers';
import type { Role } from '@/@types/rooms';

type RoleEditable = Extract<Role, 'SUB_HOST' | 'MEMBER' | 'VISITOR'>;
type RoleSelectValue = RoleEditable;
type Filter = 'all' | RoleEditable;

type User = {
  id: string;
  name: string;
  email?: string;
  role: Role;
  isOwner?: boolean;
};

type RolesPatch = {
  added: User[];
  removed: string[];
  updated: Array<{ id: string; role: RoleEditable }>;
};

type Option<T> = { label: string; value: T; disabled?: boolean; intent?: 'default' | 'danger' };

const filterOptions: Option<Filter>[] = [
  { label: '전체', value: 'all' },
  { label: '스텝', value: 'SUB_HOST' },
  { label: '멤버', value: 'MEMBER' },
];

const roleOptions: Option<RoleEditable | 'VISITOR'>[] = [
  { label: '스텝', value: 'SUB_HOST' },
  { label: '멤버', value: 'MEMBER' },
  { label: '방문자', value: 'VISITOR' },
];

function mapDtoToUsers(dto: ReturnType<typeof useRoomMembersQuery>['data']): User[] {
  return (dto ?? []).map(m => ({
    id: String(m.userId),
    name: m.nickname,
    email: undefined,
    role: m.role,
    isOwner: m.role === 'HOST',
  }));
}

function computePatch(base: User[], current: User[]): RolesPatch {
  const baseMap = new Map(base.map(u => [u.id, u]));
  const added: User[] = [];
  const removed: string[] = [];
  const updated: Array<{ id: string; role: RoleEditable }> = [];

  for (const u of current) {
    const prev = baseMap.get(u.id);
    if (!prev) {
      added.push(u);
    } else if (prev.role !== u.role) {
      if (u.role === 'SUB_HOST' || u.role === 'MEMBER' || u.role === 'VISITOR') {
        updated.push({ id: u.id, role: u.role });
      }
    }
  }
  return { added, removed, updated };
}

type Props = {
  roomId: number;
  className?: string;
  onSave?: (patch: RolesPatch, current: User[]) => Promise<void> | void;
};

export default function SettingsRoles({ roomId, className, onSave }: Props) {
  const queryClient = useQueryClient();
  const { data: membersDto } = useRoomMembersQuery(roomId, {
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const liveUsers = useMemo(() => mapDtoToUsers(membersDto), [membersDto]);
  const [filter, setFilter] = useState<Filter>('all');
  const [base, setBase] = useState<User[]>(liveUsers);
  const [users, setUsers] = useState<User[]>(liveUsers);

  useEffect(() => {
    const nextServer = liveUsers;
    const patch = computePatch(base, users);
    const isDirty = patch.added.length + patch.updated.length > 0;

    if (!isDirty) {
      setBase(nextServer);
      setUsers(nextServer);
    }
  }, [base, liveUsers, users]);

  const visibleUsers = useMemo(() => {
    if (filter === 'all') return users;
    return users.filter(u => u.role === filter || u.role === 'HOST');
  }, [users, filter]);

  const updateRole = (userId: string, next: RoleSelectValue) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: next } : u)));
  };

  const patch = useMemo(() => computePatch(base, users), [base, users]);
  const isDirty = patch.added.length + patch.updated.length > 0;

  const { save: saveBatch, saving: savingBatch } = useBatchRoleSave(roomId);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!isDirty || saving || savingBatch) return;
    const updates = patch.updated.map(u => ({
      userId: Number(u.id),
      newRole: u.role,
    }));

    try {
      setSaving(true);
      const { failed } = await saveBatch(updates);
      await onSave?.(patch, users);

      if (failed.length === 0) {
        setBase(users);
        showToast('success', '권한이 저장되었어요.');
        queryClient.invalidateQueries({ queryKey: ['roomMembers', roomId] });
      } else {
        showToast('error', `일부 실패: ${failed.length}명 - ${failed[0].error}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={clsx('w-full flex flex-col h-full', className)}>
      <div className="flex-1">
        <p className="mb-5 text-sm text-text-primary">
          참여자를 캣페 멤버로 설정하고, 함께 공부를 즐겨보세요!
        </p>

        <div className="mb-3 flex items-center justify-end">
          <CustomSelect<Filter>
            value={filter}
            onChange={v => setFilter(v)}
            options={filterOptions}
            placeholder="전체"
            size="md"
            menuWidth="trigger"
          />
        </div>

        {visibleUsers.length === 0 ? (
          <div className="mt-8 text-center text-xs text-text-secondary">
            온라인인 사용자가 없어요.😢 다른 이들과 함께일 때 다시 시도해주세요.
          </div>
        ) : (
          <ul className="flex flex-col gap-4 justify-center">
            {visibleUsers.map(u => (
              <li key={u.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-text-primary">{u.name}</div>
                  <div className="truncate text-[10px] text-text-secondary">{u.email}</div>
                </div>

                {u.role === 'HOST' ? (
                  <HostBadge />
                ) : (
                  <CustomSelect<RoleSelectValue>
                    value={u.role as RoleSelectValue}
                    onChange={v => updateRole(u.id, v)}
                    options={roleOptions}
                    placeholder={u.role}
                    size="sm"
                    menuWidth="trigger"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          size="md"
          borderType="solid"
          color="primary"
          disabled={!isDirty || saving || savingBatch}
          onClick={handleSave}
        >
          {saving || savingBatch ? '저장 중...' : isDirty ? '저장하기' : '변경 사항 없음'}
        </Button>
      </div>
    </section>
  );
}
