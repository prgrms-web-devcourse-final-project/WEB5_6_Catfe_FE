'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { hasAccessToken } from '@/utils/api';
import showToast from '@/utils/showToast';

export default function useRequireLogin(loginPath: string = '/login') {
  const router = useRouter();

  return useCallback((nextUrl?: string) => {
    if (hasAccessToken()) return true;

    showToast('warn', '로그인이 필요합니다.');
    const target = nextUrl
      ? `${loginPath}?redirect=${encodeURIComponent(nextUrl)}`
      : loginPath;

    router.push(target);
    return false;
  }, [router, loginPath]);
}
