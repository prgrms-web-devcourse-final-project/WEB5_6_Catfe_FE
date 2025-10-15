import { ApiResponse, UpdateUserBody, User } from '@/@types/type';
import api, { hasAccessToken } from '../utils/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

export async function apiDeleteMe(): Promise<void> {
  const { data: res } = await api.delete<ApiResponse<void>>('/api/users/me');
  if (!res.success) throw new Error(`DELETE /api/users/me/ failed: ${res.message}`);
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

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiPatchMe,
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: userQueryKey.me() });
      const prev = queryClient.getQueryData<User>(userQueryKey.me());
      if (prev) {
        const optimistic: User = {
          ...prev,
          profile: {
            ...prev.profile,
            ...body,
            bio: body.bio === null ? undefined : body.bio,
          },
        };
        queryClient.setQueryData(userQueryKey.me(), optimistic);
      }
      return { prev };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(userQueryKey.me(), ctx.prev); // 롤백
    },

    onSuccess: (updated) => {
      queryClient.setQueryData(userQueryKey.me(), updated); // 서버 응답으로 확정
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKey.me(), exact: true }); // 최종 동기화
    },
  });
}
