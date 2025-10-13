'use client';

import DatePicker from '@/components/mypage/planner/DatePicker';
import PlannerLayout from '@/components/mypage/planner/PlannerLayout';
import TodoList from '@/components/mypage/planner/TodoList';
import { useSelectedDate } from '@/hook/useSelectedDate';

function PlannerClient() {
  const { date, setDate, ymd } = useSelectedDate();

  return (
    <div className="flex flex-col gap-10 min-h-dvh">
      <DatePicker value={date} onChange={setDate} />
      <div className="rounded-2xl border border-secondary-900 p-6 flex flex-col gap-3 flex-1 min-h-0">
        <h3 className="font-bold text-xl mb-3">{ymd}</h3>
        {/* grid layout */}
        <div className="grid gap-4 flex-1 grid-rows-[1fr_1fr] lg:grid-rows-1 lg:grid-cols-[2fr_1fr] min-h-0 basis-0">
          {/* col-1: Planner */}
          <div className="lg:row-span-1 lg:col-span-1 min-h-0 h-full">
            <PlannerLayout />
          </div>
          {/* col-2: Todo + Memo */}
          <div className="flex flex-col gap-4 lg:row-span-1 lg:col-span-1 min-h-0 h-full">
            <div className="flex-1 min-h-0 h-full">
              <TodoList />
            </div>
            <div className="flex-1 min-h-0 h-full">
              <TodoList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PlannerClient;
