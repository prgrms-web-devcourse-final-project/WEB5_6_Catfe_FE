'use client';

import { useSelectedDate } from '@/hook/useSelectedDate';
import { formatToYMD } from '@/lib/datetime';
import PlannerGrid from './PlannerGrid';
import { useCreatePlan, useDayPlans, useUpdatePlan } from '@/hook/usePlanner';
import { useMemo, useState } from 'react';
import { CreatePlanRequestBody, RawDayPlan } from '@/@types/planner';
import CreatePlanModal from './CreatePlanModal';
import { COLOR_ORDER } from '@/lib/plannerSwatch';

type ModalInitialData = Partial<CreatePlanRequestBody> & {
  planId?: number;
};
type ModalState = ModalInitialData | null;

function PlanAndRecord() {
  const { date } = useSelectedDate();
  const ymd = formatToYMD(date);

  const { data, isLoading } = useDayPlans(ymd);
  const plans = data?.data.plans ?? [];

  const [modal, setModal] = useState<ModalState>(null);
  const createPlan = useCreatePlan(ymd);
  const updatePlan = useUpdatePlan(ymd);

  const defaultInitial = useMemo(
    () => ({
      subject: '',
      color: COLOR_ORDER[0],
      repeatRule: null,
    }),
    []
  );

  // 신규 생성 모달 열기
  const handleSelectRange = (startDate: string, endDate: string) => {
    setModal({
      ...defaultInitial,
      startDate,
      endDate,
    });
  };

  // 편집 모달 열기
  const handlePlanClick = (plan: RawDayPlan) => {
    setModal({
      planId: plan.id,
      subject: plan.subject,
      color: plan.color,
      startDate: plan.startDate,
      endDate: plan.endDate,
      repeatRule: plan.repeatRule ? { ...plan.repeatRule } : null,
    });
  };

  const closeModal = () => setModal(null);

  const submitModal = (payload: CreatePlanRequestBody) => {
    if (!modal) return;
    const { planId } = modal;

    if (!planId) {
      // 기존 id가 없으면 신규 생상
      createPlan.mutate(payload, { onSuccess: closeModal });
    } else {
      // id가 있으면 수정
      updatePlan.mutate({ id: modal.planId!, payload }, { onSuccess: closeModal });
    }
  };

  return (
    <div className="space-y-4">
      <div className="ml-8 mb-2 flex items-center justify-between">
        <span className="font-semibold whitespace-nowrap">PLAN</span>
        <span className="font-semibold whitespace-nowrap">RECORD</span>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div style={{ height: 48 * 24 }} className="animate-pulse rounded-lg bg-neutral-600/40" />
        ) : (
          <PlannerGrid
            plans={plans}
            onSelectedRange={handleSelectRange}
            onPlanClick={handlePlanClick}
          />
        )}
      </div>

      {modal && (
        <CreatePlanModal
          isEditMode={!!modal.planId}
          initial={modal}
          onSubmit={submitModal}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
export default PlanAndRecord;
