'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import CustomSelect from '@/components/CustomSelect';
import Button from '@/components/Button';
import type { Role } from '@/@types/rooms';
import HostBadge from '../HostBadge';
import { useBatchRoleSave } from '@/hook/useBatchRoleSave';
import showToast from '@/utils/showToast';

type RoleEditable = Extract<Role, 'SUB_HOST' | 'MEMBER' | 'VISITOR'>;
/** 추방 기능 비활성화: 'DELETE' 제거 */
// type RoleSelectValue = RoleEditable | 'VISITOR' | 'DELETE';
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
  /** 추방 기능 비활성화: removed는 항상 빈 배열로 유지 */
  removed: string[];
  updated: Array<{ id: string; role: RoleEditable }>;
};

type Props = {
  roomId: number;
  defaultUsers?: User[];
  className?: string;
  onSave?: (patch: RolesPatch, current: User[]) => Promise<void> | void;
};

const filterOptions = [
  { label: '전체', value: 'all' as const },
  { label: '스텝', value: 'SUB_HOST' as const },
  { label: '멤버', value: 'MEMBER' as const },
] satisfies ReadonlyArray<{ label: string; value: Filter }>;

const roleOptions = [
  { label: '스텝', value: 'SUB_HOST' as const },
  { label: '멤버', value: 'MEMBER' as const },
  { label: '방문자', value: 'VISITOR' as const },
  /** 추방 기능 비활성화
  { label: '추방', value: 'DELETE' as const, intent: 'danger' as const },
  */
] satisfies ReadonlyArray<{
  label: string;
  value: RoleSelectValue;
  disabled?: boolean;
  intent?: 'default' | 'danger';
}>;

function computePatch(base: User[], current: User[]): RolesPatch {
  const baseMap = new Map(base.map((u) => [u.id, u]));
  // const curMap = new Map(current.map((u) => [u.id, u]));

  const added: User[] = [];
  /** 🔒 추방 기능 비활성화: removed는 계산하지 않음 */
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

  /** 추방 기능 비활성화: cur에 없는 사용자를 제거하지 않음
  for (const u of base) {
    if (!curMap.has(u.id)) removed.push(u.id);
  }
  */

  return { added, removed, updated };
}

export default function SettingsRoles({ roomId, defaultUsers, className, onSave }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [base, setBase] = useState<User[]>(defaultUsers ?? []);
  const [users, setUsers] = useState<User[]>(defaultUsers ?? []);
  const [saving, setSaving] = useState(false);
  const { save: saveBatch, saving: savingBatch } = useBatchRoleSave(roomId);

  useEffect(() => {
    const next = defaultUsers ?? [];
    setBase(next);
    setUsers(next);
  }, [defaultUsers]);

  const visibleUsers = useMemo(() => {
    if (filter === 'all') return users;
    return users.filter((u) => u.role === filter || u.role === 'HOST');
  }, [users, filter]);

  const updateRole = (userId: string, next: RoleSelectValue) => {
    /** 추방 기능 비활성화
    if (next === 'DELETE') {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return;
    }
    */
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: next } : u)));
  };

  const patch = useMemo(() => computePatch(base, users), [base, users]);
  /** 추방 기능 비활성화: removed는 고려하지 않음 */
  const isDirty = patch.added.length + patch.updated.length > 0;

  const handleSave = async () => {
    if (!isDirty || saving || savingBatch) return;

    const updates = patch.updated.map((u) => ({
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
            onChange={(v) => setFilter(v)}
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
            {visibleUsers.map((u) => (
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
                    onChange={(v) => updateRole(u.id, v)}
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
