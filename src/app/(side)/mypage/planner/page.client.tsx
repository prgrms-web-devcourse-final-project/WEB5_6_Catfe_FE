'use client';

import DatePicker from '@/components/mypage/planner/DatePicker';
import { useSelectedDate } from '@/hook/useSelectedDate';

function PlannerClient() {
  const { date, setDate, ymd } = useSelectedDate();

  return (
    <div>
      <DatePicker value={date} onChange={setDate} />
    </div>
  );
}
export default PlannerClient;
