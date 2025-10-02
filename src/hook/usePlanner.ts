import { CreatePlanRequestBody, PlannerRawEnvelop } from '@/@types/planner';
import api from '@/utils/api';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const PlannerQueryKey = {
  dayPlans: (ymd: string) => ['dayPlans', ymd] as const,
  rangePlans: (start: string, end: string) => ['rangePlans', start, end] as const,
};

/** 1일치 계획 조회: GET /api/plans/date/{date} */
export function useDayPlans(ymd: string) {
  return useQuery<PlannerRawEnvelop>({
    queryKey: PlannerQueryKey.dayPlans(ymd),
    queryFn: async () => {
      const res = await api.get<PlannerRawEnvelop>(`/api/plans/date/${encodeURIComponent(ymd)}`);
      return res.data;
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/** 생성 : POST /api/plans */
export function useCreatePlan(ymd: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePlanRequestBody) => {
      const res = await api.post('/api/plans', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PlannerQueryKey.dayPlans(ymd) });
    },
  });
}

/** 수정 : PUT /api/plans/{id} */
export function useUpdatePlan(ymd: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CreatePlanRequestBody }) => {
      const { data } = await api.put(`/api/plans/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PlannerQueryKey.dayPlans(ymd) }),
  });
}
