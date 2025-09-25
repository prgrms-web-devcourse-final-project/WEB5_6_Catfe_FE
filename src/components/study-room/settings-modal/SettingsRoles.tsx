"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import CustomSelect from "@/components/CustomSelect";
import Button from "@/components/Button";

type Role = "staff" | "member" | "delete";
type Filter = "all" | Exclude<Role, "delete">;

type User = {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "delete">;
  isOwner?: boolean;
};

type RolesPatch = {
  added: User[];
  removed: string[];
  updated: Array<{ id: string; role: User["role"] }>;
};

type Props = {
  defaultUsers?: User[];
  className?: string;
  onSave?: (patch: RolesPatch, current: User[]) => Promise<void> | void;
};

const initialUsers: User[] = [
  { id: "1", name: "김유하", email: "[userEmail@naver.com]", role: "member", isOwner: true },
  { id: "2", name: "[userName]", email: "[userEmail@naver.com]", role: "member" },
];

const filterOptions = [
  { label: "전체", value: "all" as const },
  { label: "스텝", value: "staff" as const },
  { label: "멤버", value: "member" as const },
] satisfies ReadonlyArray<{ label: string; value: Filter }>;

const roleOptions = [
  { label: "스텝", value: "staff" as const },
  { label: "멤버", value: "member" as const },
  { label: "삭제", value: "delete" as const, intent: "danger" as const },
] satisfies ReadonlyArray<{
  label: string;
  value: Role;
  disabled?: boolean;
  intent?: "default" | "danger";
}>;

function computePatch(base: User[], current: User[]): RolesPatch {
  const baseMap = new Map(base.map((u) => [u.id, u]));
  const curMap = new Map(current.map((u) => [u.id, u]));

  const added: User[] = [];
  const removed: string[] = [];
  const updated: Array<{ id: string; role: User["role"] }> = [];

  for (const u of current) {
    const prev = baseMap.get(u.id);
    if (!prev) {
      added.push(u);
    } else if (prev.role !== u.role) {
      updated.push({ id: u.id, role: u.role });
    }
  }
  for (const u of base) {
    if (!curMap.has(u.id)) removed.push(u.id);
  }
  return { added, removed, updated };
}

export default function SettingsRoles({ defaultUsers, className, onSave }: Props) {
  const seed = defaultUsers ?? initialUsers;

  const [inviteEmail, setInviteEmail] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [base, setBase] = useState<User[]>(seed);
  const [users, setUsers] = useState<User[]>(seed);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = defaultUsers ?? initialUsers;
    setBase(next);
    setUsers(next);
  }, [defaultUsers]);

  const visibleUsers = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u) => u.role === filter || u.isOwner);
  }, [users, filter]);

  const updateRole = (userId: string, next: Role) => {
    if (next === "delete") {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: next } : u)));
  };

  const onInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setUsers((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: "[userName]",
        email,
        role: "member",
      },
    ]);
    setInviteEmail("");
  };

  const patch = useMemo(() => computePatch(base, users), [base, users]);
  const isDirty = patch.added.length + patch.removed.length + patch.updated.length > 0;

  const handleSave = async () => {
    if (!isDirty || saving) return;
    try {
      setSaving(true);
      if (onSave) {
        await onSave(patch, users);
      } else {
        // API 미연결
        console.log("[SettingsRoles] PATCH payload:", patch);
        console.log("[SettingsRoles] current snapshot:", users);
      }
      setBase(users);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={clsx("w-full flex flex-col h-full", className)}>
      <div className="flex-1">
        <p className="mb-2 text-xs font-semibold text-text-primary">사용자 초대</p>
        <p className="mb-2 text-xs text-text-secondary">
          사용자를 그룹 멤버로 초대하고 스터디룸 권한을 부여해보세요
        </p>

        {/* 초대 입력 */}
        <form onSubmit={onInvite} className="mb-8">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="초대할 사용자의 메일 주소를 입력해 주세요"
            className={clsx(
              "w-full h-9 rounded-lg border px-3 text-[10px] outline-none",
              "border-text-secondary/60 placeholder:text-text-secondary"
            )}
          />
        </form>

        <hr className="mb-4 border-text-secondary/60" />

        <div className="mb-3 flex items-center justify-start">
          <CustomSelect<Filter>
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            options={filterOptions}
            placeholder="전체"
            size="md"
            menuWidth="trigger"
          />
        </div>

        {/* 사용자 리스트 */}
        <ul className="flex flex-col gap-4 justify-center">
          {visibleUsers.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-text-primary">{u.name}</div>
                <div className="truncate text-[10px] text-text-secondary">{u.email}</div>
              </div>

              {u.isOwner ? (
                <OwnerBadge />
              ) : (
                <CustomSelect<Role>
                  value={u.role}
                  onChange={(v) => updateRole(u.id, v as Role)}
                  options={roleOptions}
                  placeholder="멤버"
                  size="sm"
                  menuWidth="trigger"
                />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 하단 우측 저장 버튼 */}
      <div className="mt-4 flex justify-end">
        <Button
          size="md"
          borderType="solid"
          color="primary"
          disabled={!isDirty || saving}
          onClick={handleSave}
        >
          {saving ? "저장 중..." : isDirty ? "저장하기" : "변경 사항 없음"}
        </Button>
      </div>
    </section>
  );
}

function OwnerBadge() {
  return (
    <div className="flex items-center gap-2 text-primary-500">
      <Image
        src="/icon/study-room/crown.svg"
        alt="owner"
        width={16}
        height={16}
        className="shrink-0"
      />
      <span className="text-sm font-semibold text-primary-500">소유자</span>
    </div>
  );
}
