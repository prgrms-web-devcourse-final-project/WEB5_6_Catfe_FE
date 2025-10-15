import { getMemo, saveMemo } from '@/api/apiMemo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Query Key ---
export const memoQueryKey = {
  all: () => ['memo'] as const,
  detail: (ymd: string) => [...memoQueryKey.all(), ymd] as const,
};

export function useMemoQuery(ymd: string) {
  return useQuery({
    queryKey: memoQueryKey.detail(ymd),
    queryFn: () => getMemo(ymd),
    staleTime: 5 * 60 * 1000, // 5분 동안 fresh 상태 유지
    // ymd가 유효하지 않은 경우 쿼리 비활성화
    enabled: !!ymd,
  });
}

// 메모 저장/업데이트 훅
export function useSaveMemoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ymd, description }: { ymd: string; description: string }) =>
      saveMemo(ymd, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: memoQueryKey.detail(variables.ymd),
      });
      queryClient.setQueryData(memoQueryKey.detail(variables.ymd), variables.description);
    },
    onError: (error) => {
      throw new Error(`메모 저장 실패: ${error}`);
    },
  });
}
