/* /api/users/me GET & PATCH 함수 */

import { ApiResponse, UpdateUserBody, User } from '@/@types/type';
import api, { hasAccessToken } from '../utils/api';
import { useQuery } from '@tanstack/react-query';

export const userQueryKey = {
  me: () => ['user', 'me'] as const,
};

export async function apiGetMe(): Promise<User> {
  const { data: res } = await api.get<ApiResponse<User>>('/api/users/me');
  if (!res.success) throw new Error(`GET /api/users/me/ failed: ${res.message}`);
  return res.data;
}

export async function apiPatchMe(payload: UpdateUserBody): Promise<User> {
  const { data: res } = await api.patch<ApiResponse<User>>('/api/users/me', payload);
  if (!res.success) throw new Error(`PATCH /api/users/me/ failed: ${res.message}`);
  return res.data;
}

export function useUser() {
  return useQuery<User, Error>({
    queryKey: userQueryKey.me(),
    queryFn: apiGetMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: hasAccessToken(),
  });
}
