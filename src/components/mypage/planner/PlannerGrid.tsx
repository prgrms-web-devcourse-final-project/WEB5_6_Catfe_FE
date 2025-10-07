'use client';

import { RawDayPlan } from '@/@types/planner';
import { useSelectedDate } from '@/hook/useSelectedDate';
import dayjs from '@/lib/dayjs';
import { PLAN_SWATCH } from '@/lib/plannerSwatch';
import tw from '@/utils/tw';
import { useMemo, useRef, useState } from 'react';

interface PlannerGridProps {
  plans: RawDayPlan[];
  hourHeight: number;
  onSelectedRange?: (startTime: string, endTime: string) => void;
  onPlanClick?: (plan: RawDayPlan) => void;
}

/* Plan 영역 UI/상호작용 */
function PlannerGrid({ plans, hourHeight, onSelectedRange, onPlanClick }: PlannerGridProps) {
  const { date } = useSelectedDate();
  const dayStart = useMemo(() => dayjs(date).startOf('day'), [date]);

  const gridRef = useRef<HTMLDivElement>(null);
  const gridHeight = hourHeight * 24;
  const [drag, setDrag] = useState<null | { startMin: number; curMin: number }>(null);

  const minutesToY = (mins: number) => (mins / 60) * hourHeight;
  const yToMinutes = (y: number) => Math.floor(y / hourHeight) * 60;

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSelectedRange) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-plan="1"]')) return;

    const grid = gridRef.current!;
    const rect = grid?.getBoundingClientRect();
    const y = e.clientY - rect.top + grid.scrollTop;
    const startMin = yToMinutes(y);
    setDrag({ startMin, curMin: startMin });

    const onMove = (ev: MouseEvent) => {
      const y2 = ev.clientY - rect.top + grid?.scrollTop;
      setDrag((d) => (d ? { ...d, curMin: yToMinutes(y2) } : d));
    };
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);

      const y2 = ev.clientY - rect.top + grid.scrollTop;
      const finalCurMin = yToMinutes(y2);
      setDrag(null);

      const dragStart = Math.min(startMin, finalCurMin);
      const dragEnd = Math.max(startMin, finalCurMin);
      if (dragStart === dragEnd) return;

      setTimeout(() => {
        const start = dayStart.add(dragStart, 'minute');
        const end = dayStart.add(dragEnd, 'minute');
        const fixedEnd = end.isAfter(start) ? end : start.add(1, 'hour');
        onSelectedRange?.(
          start.format('YYYY-MM-DDTHH:mm:ss'),
          fixedEnd.format('YYYY-MM-DDTHH:mm:ss')
        );
      }, 0);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const onGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-plan="1"]') || drag !== null) return;
    if (!onSelectedRange) return;
    const grid = gridRef.current!;
    const rect = grid.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const startMin = yToMinutes(y);
    const start = dayStart.add(startMin, 'minute');
    const end = start.add(1, 'hour');
    onSelectedRange(start.toISOString(), end.toISOString());
  };

  return (
    <div
      ref={gridRef}
      className="relative h-full w-full bg-transparent"
      style={{ minHeight: gridHeight }}
      onMouseDown={onMouseDown}
      onClick={onGridClick}
    >
      {/* Drag 범위 표시 */}
      {drag && (
        <div
          className="absolute left-0 right-0 bg-yellow-300/20 border border-yellow-300/60 rounded"
          style={{
            top: minutesToY(Math.min(drag.startMin, drag.curMin)),
            height: Math.max(hourHeight, minutesToY(Math.abs(drag.curMin - drag.startMin))),
          }}
        ></div>
      )}

      {/* 계획 블록 */}
      {plans &&
        plans.map((plan) => {
          const top = minutesToY(dayjs(plan.startDate).diff(dayStart, 'minute'));
          const height = Math.max(
            10,
            minutesToY(dayjs(plan.endDate).diff(dayjs(plan.startDate), 'minute'))
          );
          const sw = PLAN_SWATCH[plan.color];
          return (
            <div
              key={plan.id}
              data-plan="1"
              className="absolute left-0 right-0 px-3"
              style={{ top, height }}
              onClick={(e) => {
                e.stopPropagation();
                onPlanClick?.(plan);
              }}
            >
              <div
                className={tw(
                  'h-full rounded-md border px-2 py-1 text-xs text-text-secondary shadow overflow-hidden',
                  sw.fill,
                  sw.border
                )}
              >
                <div className="font-medium truncate select-none pointer-events-none">
                  {plan.subject}
                </div>
                <div className="opacity-70 select-none pointer-events-none whitespace-nowrap overflow-ellipsis">
                  {dayjs(plan.startDate).format('HH:mm')} ~ {dayjs(plan.endDate).format('HH:mm')}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
export default PlannerGrid;
