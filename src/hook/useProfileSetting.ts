'use client';

import { UpdateUserBody, User } from '@/@types/type';
import { apiGetMe, apiPatchMe } from '@/utils/api/apiUsersMe';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useProfileSetting() {
  const qc = useQueryClient();

  const meQuery = useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: apiGetMe,
    staleTime: 60_000,
    // throwOnError: true,
    // retry: 1,
  });

  const patch = useMutation<User, Error, UpdateUserBody>({
    mutationFn: apiPatchMe,
    onSuccess: (res) => {
      qc.setQueryData(['me'], res);
    },
  });

  return {
    data: meQuery.data,
    isLoading: meQuery.isLoading,
    saveProfile: (body: UpdateUserBody) => patch.mutateAsync(body),
    saving: patch.isPending,
  };
}
