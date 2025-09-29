"use client";

import { useId, useMemo, useState } from "react";
import type { UsersListItem } from "@/@types/room";
import UsersHeader from "./UserHeader";
import UsersSearchBar from "./UserSearchBar";
import UsersSection from "./UserSection";
import UserRow from "./UserRow";

type Props = {
  users: UsersListItem[];
  canControl?: boolean;
  onToggleMute?: (id: string) => void;
  onClose?: () => void;
  className?: string;
};

export default function UsersPanel({
  users, canControl = false, onToggleMute, onClose,
}: Props) {
  const titleId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [adminCollapsed, setAdminCollapsed] = useState(false);
  const [memberCollapsed, setMemberCollapsed] = useState(false);

  const { admins, members } = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term ? users.filter(u => u.name.toLowerCase().includes(term)) : users;
    return {
      admins: filtered.filter(u => u.role === "owner" || u.role === "staff"),
      members: filtered.filter(u => u.role === "member"),
    };
  }, [users, search]);

  return (
    <div className="border rounded-2xl p-3 w-[15vw] min-w-[250px] max-w-300px bg-background-white">
      <UsersHeader
        titleId={titleId}
        onToggleSearch={() => setSearchOpen(v => !v)}
        onClose={onClose}
      />

      {searchOpen && (
        <UsersSearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
        />
      )}

      <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
        <UsersSection
          title="관리자"
          collapsed={adminCollapsed}
          onToggle={() => setAdminCollapsed(v => !v)}
        >
          {admins.map(u => (
            <UserRow
              key={u.id}
              user={u}
              canControl={canControl}
              onToggleMute={onToggleMute}
            />
          ))}
          {admins.length === 0 && (
            <li className="py-6 text-sm text-text-secondary">관리자가 없어요.</li>
          )}
        </UsersSection>

        <UsersSection
          title="멤버 및 게스트"
          collapsed={memberCollapsed}
          onToggle={() => setMemberCollapsed(v => !v)}
        >
          {members.map(u => (
            <UserRow
              key={u.id}
              user={u}
              canControl={canControl}
              onToggleMute={onToggleMute}
            />
          ))}
          {members.length === 0 && (
            <li className="py-6 text-sm text-text-secondary">표시할 사용자가 없어요.</li>
          )}
        </UsersSection>
      </div>
    </div>
  );
}
