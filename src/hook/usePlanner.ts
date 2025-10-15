import {
  CreatePlanRequestBody,
  DeletePlanPayload,
  PlannerRawEnvelop,
  RawDayPlan,
  UpdatePlanPayload,
} from '@/@types/planner';
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

/** 수정 : PUT /api/plans/{planId} */
export function useUpdatePlan(ymd: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload, applyScope }: UpdatePlanPayload) => {
      let url = `/api/plans/${id}`;
      const params = new URLSearchParams();

      params.append('applyScope', applyScope || 'THIS_ONLY');
      url += `?${params.toString()}`;

      const { data } = await api.put(url, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PlannerQueryKey.dayPlans(ymd) }),
  });
}

/** 삭제 : DELETE /api/plans/{planId} */
/*
  반복 계획의 경우 적용 범위를 applyScope로 설정 할 수 있으며 클라이언트에서는 paln에 repeat_rule이 있으면 반복 계획으로 간주하고 반드시 apply_scope를 쿼리 파라미터로 넘겨야 합니다.
  repeat_rule이 없으면 단발성 계획으로 간주하여 삭제 범위를 설정 할 필요가 없으므로 apply_scope를 넘기지 않아도 됩니다.
 */
export function useDeletePlan(ymd: string) {
  const qc = useQueryClient();
  const queryKey = PlannerQueryKey.dayPlans(ymd);
  const allDayPlansPrefix = ['dayPlans'];

  return useMutation({
    mutationFn: async ({ id, selectedDate, applyScope }: DeletePlanPayload) => {
      let url = `/api/plans/${id}`;
      const params = new URLSearchParams();

      params.append('selectedDate', selectedDate);
      params.append('applyScope', applyScope);
      url += `?${params.toString()}`;

      await api.delete(url);
    },
    onMutate: async (deletedPayload) => {
      await qc.cancelQueries({ queryKey });
      const previousPlans = qc.getQueryData(queryKey);
      qc.setQueryData<PlannerRawEnvelop | undefined>(
        queryKey,
        (oldData?: PlannerRawEnvelop): PlannerRawEnvelop | undefined => {
          if (!oldData) return oldData;
          const newPlans: RawDayPlan[] = (oldData.data.plans as RawDayPlan[]).filter(
            (plan: RawDayPlan) => plan.id !== deletedPayload.id
          );
          return {
            ...oldData,
            data: { ...oldData.data, plans: newPlans },
          };
        }
      );
      return { previousPlans };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: allDayPlansPrefix }),
    onError: (err, deletedPayload, context) => {
      if (context?.previousPlans) {
        qc.setQueryData(queryKey, context.previousPlans);
        console.error(err, deletedPayload);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });
}
