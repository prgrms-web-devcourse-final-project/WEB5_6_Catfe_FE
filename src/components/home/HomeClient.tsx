'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import GuestHome from './GuestHome';
import UserHome from './UserHome';
import { useUser } from '@/api/apiUsersMe';
import LoadingPage from '@/app/loading';

export default function HomeClient() {
  const { isHydrated, init } = useAuthStore();
  const { data: user, isLoading: isLoadingUser } = useUser();

  useEffect(() => {
    init();
  }, [init]);

  if (!isHydrated || isLoadingUser) {
    return <LoadingPage />;
  }

  if (!user) {
    return <GuestHome />;
  }

  return <UserHome user={user} />;
}
