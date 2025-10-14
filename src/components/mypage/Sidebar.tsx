'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import SidebarItem from './SidebarItem';
import { UserProfile } from '@/@types/type';
import SideBarToggle from './SideBarToggle';
import { useUser } from '@/api/apiUsersMe';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

const NAV: NavItem[] = [
  {
    href: '/mypage',
    label: 'Home',
    icon: '/icon/mypage/home.svg',
    activeIcon: '/icon/mypage/home-active.svg',
  },
  {
    href: '/mypage/planner',
    label: 'Planner',
    icon: '/icon/mypage/planner.svg',
    activeIcon: '/icon/mypage/planner-active.svg',
  },
  {
    href: '/mypage/settings',
    label: 'Settings',
    icon: '/icon/mypage/settings.svg',
    activeIcon: '/icon/mypage/settings-active.svg',
  },
];

const STORAGE_KEY = 'mypage.sidebar.collapsed';

function MyPageSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const { data: user, isLoading } = useUser();

  // 최초 로드 시 접힘 상태 기억 및 복원
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) setCollapsed(raw === 'closed');
  }, []);

  // 현재 페이지 확인
  const isActive = useMemo(() => (href: string) => pathname === href, [pathname]);

  if (isLoading) {
    return <div className="w-1/8 max-w-[70px] h-full bg-gray-300 animate-pulse"></div>;
  }

  const currentUser: Partial<UserProfile> = user?.profile || {
    nickname: 'GUEST',
    profileImageUrl: '/image/cat-default.svg',
  };

  return (
    <aside
      className={[
        'relative h-full bg-secondary-100 ring-1 ring-black/5 shadow-[0px_16px_44px_0px_rgba(0,0,0,0.07)]',
        'flex flex-col justify-between items-center',
        'transition-all duration-300 ease-out will-change-[width]',
        collapsed ? 'w-1/8 max-w-[70px]' : 'w-1/4 max-w-[200px]',
      ].join(' ')}
      aria-label="MyPage Navigation"
    >
      <SideBarToggle collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div className="flex flex-col">
        {/* 상단 로고 */}
        <h1 className="flex items-center justify-center px-4 py-5">
          <Link
            href="/"
            className="focus:outline-none focus:ring-2 focus:ring-secondary-400 bg-secondary-100"
          >
            {collapsed ? (
              <div className="w-[38px] h-[30px] relative">
                <Image
                  src="/image/logo-mypage.svg"
                  alt="Catfé Logo"
                  fill
                  priority
                  className={[
                    'transition-opacity duration-300 ease-out',
                    collapsed ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                />
              </div>
            ) : (
              <div className="w-[145px] h-[35px] relative">
                <Image
                  src="/image/logo-light.svg"
                  alt="Catfé Logo"
                  fill
                  priority
                  className={[
                    'transition-opacity duration-300 ease-out',
                    collapsed ? 'opacity-0' : 'opacity-100',
                  ].join(' ')}
                />
              </div>
            )}
          </Link>
        </h1>

        {/* 구분선 */}
        <div className="mx-2 h-px bg-secondary-900" />

        {/* 내비게이션 */}
        <nav>
          {NAV.map(({ href, label, icon, activeIcon }) => (
            <SidebarItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              activeIcon={activeIcon}
              active={isActive(href)}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>

      {/* 유저 프로필 */}
      <div className="flex flex-col gap-5 pb-6 w-full px-3">
        <div className="mx-2 h-px bg-secondary-900" />
        <Link
          href="/mypage"
          className={[
            'flex mx-auto gap-2',
            'focus:outline-none focus:ring-2 focus:ring-secondary-400',
          ].join(' ')}
        >
          <div className="size-8 rounded-full border-2 border-gray-400 overflow-hidden relative">
            <Image
              src={currentUser.profileImageUrl || '/image/cat-default.svg'}
              alt={currentUser.nickname || '프로필 사진'}
              fill
            />
          </div>
          {!collapsed && (
            <div
              className={[
                'transition-opacity duration-300 ease-out delay-100',
                collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-200',
              ].join(' ')}
            >
              <p className="text-xs text-gray-500 font-light">환영합니다👋</p>
              <p className="text-sm">{currentUser.nickname} 님</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
export default MyPageSidebar;
