'use client';

import { useSelectedDate } from '@/hook/useSelectedDate';
import { formatToYMD } from '@/lib/datetime';
import PlannerGrid from './PlannerGrid';
import { useCreatePlan, useDayPlans, useDeletePlan, useUpdatePlan } from '@/hook/usePlanner';
import { useCallback, useMemo, useState } from 'react';
import { ApplyScope, RawDayPlan } from '@/@types/planner';
import CreatePlanModal, { SubmitPayload } from './CreatePlanModal';
import { COLOR_ORDER } from '@/lib/plannerSwatch';
import { PlannerFormInitial } from '@/hook/usePlannerForm';
import showToast from '@/utils/showToast';

type ModalState = (PlannerFormInitial & { planId?: number }) | null;

/* Plan 영역 데이터/상태 제어 */
function PlanDataContainer({ hourHeight }: { hourHeight: number }) {
  const { date } = useSelectedDate();
  const ymd = formatToYMD(date);

  const { data, isLoading } = useDayPlans(ymd);
  const plans = data?.data.plans ?? [];

  const [modal, setModal] = useState<ModalState>(null);
  const createPlan = useCreatePlan(ymd);
  const updatePlan = useUpdatePlan(ymd);
  const deletePlan = useDeletePlan(ymd);

  const defaultInitial = useMemo(
    () => ({
      subject: '',
      color: COLOR_ORDER[0],
      repeatRule: null,
    }),
    []
  );

  // 시간 Range 선택 -> 신규 생성 모달 열기
  const handleSelectRange = useCallback(
    (startDate: string, endDate: string) => {
      setModal({
        ...defaultInitial,
        startDate,
        endDate,
      });
    },
    [defaultInitial]
  );

  // 기존 Plan 클릭 -> 편집 모달 열기
  const handlePlanClick = useCallback((plan: RawDayPlan) => {
    setModal({
      planId: plan.id,
      subject: plan.subject,
      color: plan.color,
      startDate: plan.startDate,
      endDate: plan.endDate,
      repeatRule: plan.repeatRule ? { ...plan.repeatRule } : null,
    });
  }, []);

  const closeModal = () => setModal(null);

  const submitModal = (payload: SubmitPayload) => {
    if (!modal) return;
    const { planId } = modal;
    const onSuccess = () => {
      closeModal();
      showToast('success', `계획이 ${planId ? '수정' : '등록'}되었습니다.`);
    };
    if (!planId) {
      // 기존 id가 없으면 신규 생상
      createPlan.mutate(payload, { onSuccess });
    } else {
      // id가 있으면 수정
      const { applyScope } = payload;
      updatePlan.mutate({ id: modal.planId!, payload: payload, applyScope }, { onSuccess });
    }
  };

  const deleteModal = (scope: { applyScope: ApplyScope }) => {
    if (!modal?.planId) return;
    const onSuccess = () => {
      closeModal();
      showToast('success', `계획이 삭제되었습니다.`);
    };
    deletePlan.mutate(
      {
        id: modal.planId,
        selectedDate: ymd,
        applyScope: scope.applyScope,
      },
      { onSuccess }
    );
  };

  if (isLoading)
    return (
      <div
        style={{ height: hourHeight * 24 }}
        className="absolute inset-0 animate-pulse rounded-lg bg-neutral-600/40"
      />
    );

  return (
    <>
      <PlannerGrid
        plans={plans}
        hourHeight={hourHeight}
        onSelectedRange={handleSelectRange}
        onPlanClick={handlePlanClick}
      />
      {modal && (
        <CreatePlanModal
          isEditMode={!!modal.planId}
          selectedYmd={ymd}
          initial={modal}
          onSubmit={submitModal}
          onDelete={deleteModal}
          onClose={closeModal}
        />
      )}
    </>
  );
}
export default PlanDataContainer;
