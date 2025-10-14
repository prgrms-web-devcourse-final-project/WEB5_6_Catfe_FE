'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/api/apiUsersMe';
import showToast from '@/utils/showToast';
import LoadingPage from '@/app/loading';

export default function AuthChecker({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      showToast('error', '로그인이 필요한 서비스입니다.');
      // 로그인 페이지로 리다이렉트
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);

  if (isLoading || (isError && !user)) {
    return <LoadingPage />;
  }

  // user 정보가 정상적으로 로드된 경우 하위 페이지/컴포넌트 렌더링
  if (user) {
    return <>{children}</>;
  }

  // user가 없지만 리다이렉션 로직이 아직 완료되지 않았을 경우 잠시 빈 화면
  return null;
}
