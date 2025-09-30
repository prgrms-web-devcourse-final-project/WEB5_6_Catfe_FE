'use client';

import { useSelectedDate } from '@/hook/useSelectedDate';
import { formatToYMD } from '@/lib/datetime';
import PlannerGrid from './PlannerGrid';

function PlanAndRecord() {
  const { date } = useSelectedDate();
  const ymd = formatToYMD(date);

  return (
    <div>
      <div className="ml-8 mb-2 flex items-center justify-between">
        <span className="font-semibold whitespace-nowrap">PLAN</span>
        <span className="font-semibold whitespace-nowrap">RECORD</span>
      </div>
      <PlannerGrid />
    </div>
  );
}
export default PlanAndRecord;
