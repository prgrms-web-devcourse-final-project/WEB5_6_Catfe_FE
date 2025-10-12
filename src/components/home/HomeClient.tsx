'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import GuestHome from './GuestHome';
import UserHome from './UserHome';
import { useUser } from '@/api/apiUsersMe';

export default function HomeClient() {
  const { isHydrated, init } = useAuthStore();
  const { data: user, isLoading: isLoadingUser } = useUser();

  useEffect(() => {
    init();
  }, [init]);

  if (!isHydrated || isLoadingUser) {
    return <div>로딩중...</div>; // 추후 로딩페이지..?
  }

  if (!user) {
    return <GuestHome />;
  }

  return <UserHome user={user} />;
}
