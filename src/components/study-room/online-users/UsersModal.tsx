'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type { UsersListItem } from '@/@types/rooms';
import UsersHeader from './UserHeader';
import UsersSearchBar from './UserSearchBar';
import UsersSection from './UserSection';
import UserRow from './UserRow';
import clsx from 'clsx';
import { debounce } from '@/utils/debounce';

type Props = {
  users: UsersListItem[];
  canControl?: boolean;
  onToggleMute?: (id: string) => void;
  onClose?: () => void;
  className?: string;
  maxBodyHeight?: string;
};

export default function UsersModal({
  users,
  canControl = false,
  onToggleMute,
  onClose,
  className,
  maxBodyHeight = '60vh',
}: Props) {
  const titleId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [adminCollapsed, setAdminCollapsed] = useState(false);
  const [memberCollapsed, setMemberCollapsed] = useState(false);

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(query);
  }, [query, debouncedSetSearch]);

  const { admins, members } = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term ? users.filter((u) => u.name.toLowerCase().includes(term)) : users;
    return {
      admins: filtered.filter((u) => u.role === 'HOST' || u.role === 'SUB_HOST'),
      members: filtered.filter((u) => u.role === 'MEMBER' || u.role === 'VISITOR'),
    };
  }, [users, search]);

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={clsx(
        'border rounded-2xl p-5 bg-background-white shadow-lg',
        'w-[15vw] min-w-[270px] max-w-[300px]',
        className
      )}
    >
      <UsersHeader
        titleId={titleId}
        onToggleSearch={() => setSearchOpen((v) => !v)}
        onClose={onClose}
      />

      {searchOpen && (
        <UsersSearchBar
          value={query}
          onChange={setQuery}
          onClear={() => {
            setQuery('');
            setSearch('');
          }}
        />
      )}

      <div className="overflow-y-auto" style={{ maxHeight: maxBodyHeight }}>
        <UsersSection
          title="관리자"
          collapsed={adminCollapsed}
          onToggle={() => setAdminCollapsed((v) => !v)}
        >
          {admins.map((u) => (
            <UserRow key={u.id} user={u} canControl={canControl} onToggleMute={onToggleMute} />
          ))}
          {admins.length === 0 && (
            <li className="py-6 text-sm text-text-secondary">관리자가 없어요.</li>
          )}
        </UsersSection>

        <UsersSection
          title="멤버 및 게스트"
          collapsed={memberCollapsed}
          onToggle={() => setMemberCollapsed((v) => !v)}
        >
          {members.map((u) => (
            <UserRow key={u.id} user={u} canControl={canControl} onToggleMute={onToggleMute} />
          ))}
          {members.length === 0 && (
            <li className="py-6 text-sm text-text-secondary">표시할 사용자가 없어요.</li>
          )}
        </UsersSection>
      </div>
    </div>
  );
}
