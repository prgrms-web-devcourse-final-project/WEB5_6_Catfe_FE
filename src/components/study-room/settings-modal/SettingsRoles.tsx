'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import CustomSelect from '@/components/CustomSelect';
import Button from '@/components/Button';
import type { Role } from '@/@types/rooms';
import HostBadge from '../HostBadge';
import { useBatchRoleSave } from '@/hook/useBatchRoleSave';
import showToast from '@/utils/showToast';

type RoleEditable = Extract<Role, 'SUB_HOST' | 'MEMBER' | "VISITOR">;
type RoleSelectValue = RoleEditable | 'VISITOR' | 'DELETE';
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
  { label: '추방', value: 'DELETE' as const, intent: 'danger' as const },
] satisfies ReadonlyArray<{
  label: string;
  value: RoleSelectValue;
  disabled?: boolean;
  intent?: 'default' | 'danger';
}>;

function computePatch(base: User[], current: User[]): RolesPatch {
  const baseMap = new Map(base.map((u) => [u.id, u]));
  const curMap = new Map(current.map((u) => [u.id, u]));

  const added: User[] = [];
  const removed: string[] = [];
  const updated: Array<{ id: string; role: RoleEditable }> = [];

  for (const u of current) {
    const prev = baseMap.get(u.id);
    if (!prev) {
      added.push(u);
    } else if (prev.role !== u.role) {
      // HOST는 제외, 나머지 3개 편집 가능
      if (u.role === "SUB_HOST" || u.role === "MEMBER" || u.role === "VISITOR") {
        updated.push({ id: u.id, role: u.role });
      }
    }
  }
  for (const u of base) {
    if (!curMap.has(u.id)) removed.push(u.id); // 추방(DELETE)을 여기서 잡지만, 이번 저장 로직에서는 사용 안 함
  }
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
    if (next === 'DELETE') {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: next } : u)));
  };

  const patch = useMemo(() => computePatch(base, users), [base, users]);
  const isDirty = patch.added.length + patch.removed.length + patch.updated.length > 0;

  const handleSave = async () => {
    if (!isDirty || saving || savingBatch) return;

    // 1) UI에서 계산된 patch.updated → API용 업데이트 배열로 변환
    const updates = patch.updated.map((u) => ({
      userId: Number(u.id),
      newRole: u.role, // "SUB_HOST" | "MEMBER" | "VISITOR"
    }));

    try {
      setSaving(true);

      // 2) 배치 저장
      const { succeeded, failed } = await saveBatch(updates);

      // (선택) 외부 콜백 호출
      await onSave?.(patch, users);

      // 3) 성공한 경우 base 동기화
      if (failed.length === 0) {
        setBase(users);
        showToast("success", "권한이 저장되었어요.");
      } else {
        // 부분 실패 처리
        showToast("error", `일부 실패: ${failed.length}명 - ${failed[0].error}`);
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

        {/* 사용자 리스트 */}
        {visibleUsers.length === 0 ? (
          <div className="mt-8 text-center text-xs text-text-secondary">
            아직 멤버가 없어요. 상단에서 이메일로 멤버를 초대해보세요!
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

      {/* 하단 저장 */}
      <div className="mt-4 flex justify-end">
        <Button
          size="md"
          borderType="solid"
          color="primary"
          disabled={!isDirty || saving || savingBatch}
          onClick={handleSave}
        >
          {saving || savingBatch ? "저장 중..." : isDirty ? "저장하기" : "변경 사항 없음"}
        </Button>
      </div>
    </section>
  );
}
