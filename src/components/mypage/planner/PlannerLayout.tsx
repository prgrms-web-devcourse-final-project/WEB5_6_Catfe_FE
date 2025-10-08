'use client';

import { HOURS } from '@/lib/datetime';
import { useEffect, useMemo, useState } from 'react';
import PlanDataContainer from './PlanDataContainer';
import RecordDataContainer from './RecordDataContainer';
import { useSelectedDate } from '@/hook/useSelectedDate';
import dayjs from '@/lib/dayjs';

/* 스터디플래너 영역 레이아웃 ( Plan | 시간 | Record ) */
function PlannerLayout() {
  const [hourHeight, setHourHeight] = useState(48);
  const { date } = useSelectedDate();
  const dayStart = useMemo(() => dayjs(date).startOf('day'), [date]);
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

  return (
    <div
      className="relative flex-1 p-6 rounded-2xl border border-secondary-900 overflow-auto bg-background-white pt-0"
      style={{ height: hourHeight * 12, maxHeight: gridHeight }}
    >
      <div className="sticky top-0 z-40 bg-background-white flex items-center justify-between p-2 pt-6">
        <span className="font-semibold whitespace-nowrap w-1/2 text-left">PLAN</span>
        <span className="font-semibold whitespace-nowrap w-1/2 text-right">RECORD</span>
      </div>

      <div className="flex relative" style={{ minHeight: gridHeight }}>
        <div className="absolute inset-0 -z-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`plan-line-${i}`}
              className="absolute left-0 right-0 border-t border-secondary-900"
              style={{ top: i * hourHeight }}
            />
          ))}
        </div>

        {/* Plan */}
        <div className="flex-1 relative overflow-auto">
          <PlanDataContainer hourHeight={hourHeight} />
        </div>

        {/* Time Label */}
        <div className="w-12 flex-shrink-0 flex flex-col pointer-events-none select-none border border-secondary-900 sticky left-1/2 -translate-x-1/2 z-20 bg-background-white">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="text-xs text-text-secondary font-bold text-center"
              style={{ height: `${hourHeight}px`, lineHeight: `${hourHeight}px` }}
            >
              {hour.toString().padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Record */}
        <div className="flex-1 relative overflow-auto">
          <RecordDataContainer hourHeight={hourHeight} />
        </div>

        {/* 현재 시간 indicator */}
        {isToday && nowTop >= 0 && nowTop <= gridHeight && (
          <div className="pointer-events-none absolute left-8 right-0 z-30" style={{ top: nowTop }}>
            <div className="h-0 border-t-2 border-primary-700" />
            <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-primary-700" />
          </div>
        )}
      </div>
    </div>
  );
}
export default PlannerLayout;
