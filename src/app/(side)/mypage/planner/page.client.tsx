'use client';

import DatePicker from '@/components/mypage/planner/DatePicker';
import PlannerLayout from '@/components/mypage/planner/PlannerLayout';
import { useSelectedDate } from '@/hook/useSelectedDate';

function PlannerClient() {
  const { date, setDate } = useSelectedDate();

  return (
    <div className="flex flex-col gap-10 h-dvh">
      <DatePicker value={date} onChange={setDate} />
      <div className="rounded-2xl border border-secondary-900 flex-1 p-6">
        <PlannerLayout />
      </div>
    </div>
  );
}
export default PlannerClient;
