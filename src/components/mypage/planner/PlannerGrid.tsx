'use client';

import { RawDayPlan } from '@/@types/planner';
import { useSelectedDate } from '@/hook/useSelectedDate';
import { HOURS } from '@/lib/datetime';
import dayjs from '@/lib/dayjs';
import { PLAN_SWATCH } from '@/lib/plannerSwatch';
import tw from '@/utils/tw';
import { useEffect, useMemo, useRef, useState } from 'react';

interface PlannerGridProps {
  plans: RawDayPlan[];
  onSelectedRange?: (startTime: string, endTime: string) => void;
  onPlanClick?: (plan: RawDayPlan) => void;
}

function PlannerGrid({ plans, onSelectedRange, onPlanClick }: PlannerGridProps) {
  const { date } = useSelectedDate();
  const dayStart = useMemo(() => dayjs(date).startOf('day'), [date]);
  const [hourHeight, setHourHeight] = useState(48);
  const isToday = dayjs().isSame(dayStart, 'day');
  const nowTop = isToday ? (dayjs().diff(dayStart, 'minute') / 60) * hourHeight : -9999;

  useEffect(() => {
    const compute = () => {
      const vh = window.innerHeight;
      const target = Math.floor((vh * 0.8) / 24); // 화면 높이 80%를 24h로 분배
      const clamped = Math.max(40, Math.min(60, target)); // 최대 최소 높이 설정
      setHourHeight(clamped);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  });
  const gridHeight = hourHeight * 24;

  const gridRef = useRef<HTMLDivElement>(null);
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
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setDrag((d) => {
        if (!d) return null;
        const a = Math.min(d.startMin, d.curMin);
        const b = Math.max(d.startMin, d.curMin);
        const start = dayStart.add(a, 'minute');
        const end = dayStart.add(b, 'minute');
        const fixedEnd = end.isAfter(start) ? end : start.add(1, 'hour');
        onSelectedRange?.(start.toISOString(), fixedEnd.toISOString());
        return null;
      });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const onGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSelectedRange || drag !== null) return;
    const grid = gridRef.current!;
    const rect = grid.getBoundingClientRect();
    const y = e.clientY - rect.top + grid.scrollTop;
    const startMin = yToMinutes(y);
    const start = dayStart.add(startMin, 'minute');
    const end = start.add(1, 'hour');
    onSelectedRange(start.toISOString(), end.toISOString());
  };

  return (
    <div
      ref={gridRef}
      className="relative overflow-auto"
      style={{ height: hourHeight * 12, maxHeight: hourHeight * 24 }}
      onMouseDown={onMouseDown}
      onClick={onGridClick}
    >
      {/* 시간 label */}
      <div className="flex flex-col pointer-events-none select-none">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="text-xs text-text-secondary font-bold"
            style={{ height: `${hourHeight}px`, lineHeight: `${hourHeight}px` }}
          >
            {hour.toString().padStart(2, '0')}
          </div>
        ))}
      </div>
      {/* 시간 line */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-neutral-700"
          style={{ top: i * hourHeight }}
        >
          {i < 24 && (
            <div className="absolute -left-12 top-0 text-xs text-text-secondary">
              {String(i).padStart(2, '0')}:00
            </div>
          )}
        </div>
      ))}

      {/* Drag 범위 표시 */}
      {drag && (
        <div
          className="absolute left-0 right-0 bg-yellow-300/20 border border-yellow-300/60 rounded"
          style={{
            top: minutesToY(Math.min(drag.startMin, drag.curMin)),
            height: Math.max(6, minutesToY(Math.abs(drag.curMin - drag.startMin))),
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
              data-plan={plan.id}
              className="absolute left-0 right-0 px-1"
              style={{ top, height }}
              onClick={(e) => {
                e.stopPropagation();
                onPlanClick?.(plan);
              }}
            >
              <div
                className={tw(
                  'h-full rounded-md border px-2 py-1 text-xs text-text-secondary shadow',
                  sw.fill,
                  sw.border
                )}
              >
                <div className="font-medium truncate">{plan.subject}</div>
                <div className="opacity-70">
                  {dayjs(plan.startDate).format('HH:mm')} ~ {dayjs(plan.endDate).format('HH:mm')}
                </div>
              </div>
            </div>
          );
        })}

      {/* 현재 시간 indicator */}
      {isToday && nowTop >= 0 && nowTop <= gridHeight && (
        <div className="pointer-events-none absolute left-8 right-0 z-10" style={{ top: nowTop }}>
          <div className="h-0 border-t-2 border-primary-700" />
          <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-primary-700" />
        </div>
      )}
    </div>
  );
}
export default PlannerGrid;
