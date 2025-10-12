import { userQueryKey } from '@/api/apiUsersMe';
import { useAuthStore } from '@/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { communityQueryKey } from './useCommunityPost';
import { User } from '@/@types/type';

export function useLogout() {
  const queryClient = useQueryClient();
  const authLogout = useAuthStore((state) => state.logout);

  const performLogout = async () => {
    queryClient.setQueryData<User | undefined>(userQueryKey.me(), undefined);

    // 1. Zustand의 로그아웃 로직 실행 (서버 로그아웃 및 로컬 스토리지 정리)
    await authLogout();

    // 2. TanStack Query 캐시 정리
    queryClient.removeQueries({ queryKey: userQueryKey.me() });
    queryClient.invalidateQueries({ queryKey: communityQueryKey.all() });

    // (로그인 페이지로 리다이렉트)
    window.location.href = '/login';
  };

  return performLogout;
}
