'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAccessToken } from '@/utils/api';
import { useQueryClient } from '@tanstack/react-query';
import { userQueryKey } from '@/api/apiUsersMe';

export default function LoginOAuth2Page() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    async function handleSocialLogin() {
      try {
        // refresh → accessToken 받기
        const res = await api.post('/api/auth/refresh', null, {
          withCredentials: true,
        });

        const { accessToken } = res.data.data;
        setAccessToken(accessToken);
        await queryClient.invalidateQueries({ queryKey: userQueryKey.me() });

        router.replace('/');
      } catch (err) {
        console.error('소셜 로그인 처리 실패:', err);
        router.replace('/login');
      }
    }

    handleSocialLogin();
  }, [router, queryClient]);

  return <p>소셜 로그인 처리 중입니다...</p>;
}
