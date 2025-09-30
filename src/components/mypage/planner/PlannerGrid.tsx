'use client';

import { useSelectedDate } from '@/hook/useSelectedDate';
import { HOURS } from '@/lib/datetime';
import dayjs from '@/lib/dayjs';
import { useEffect, useMemo, useState } from 'react';

function PlannerGrid() {
  const { date } = useSelectedDate();
  const [hourHeight, setHourHeight] = useState(48);

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

  const dayStart = useMemo(() => dayjs(date).startOf('day'), [date]);
  const dayEnd = useMemo(() => dayjs(date).endOf('day'), [date]);
  const isToday = dayjs().isSame(dayStart, 'day');
  const gridHeight = hourHeight * 24;
  const nowTop = useMemo(() => {
    if (!isToday) return -9999;
    const minutesFromStart = dayjs().diff(dayStart, 'minute');
    return (minutesFromStart / 60) * hourHeight;
  }, [isToday, dayStart, hourHeight]);

  return (
    <div className="relative select-none">
      <div className="grid grid-cols-[32px_1fr]">
        {/* 시간 label */}
        <div className="flex flex-col">
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

        {/* 타임라인 */}
        <div className="relative" style={{ height: gridHeight }}>
          {/* 1시간마다 grid 선 */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-zinc-500/70"
              style={{ top: hour * hourHeight }}
            />
          ))}
          {/* 클릭할 수 있는 slot */}
          <div className="absolute inset-0">
            {HOURS.map((hour) => {
              const top = hour * hourHeight;
              const label = `${String(hour).padStart(2, '0')}:00`;
              return (
                <button
                  key={`slot-${hour}`}
                  type="button"
                  title={label}
                  aria-label={label}
                  className={[
                    'absolute left-0 right-0 cursor-pointer',
                    'hover:bg-secondary-200/40 transition-colors',
                  ].join(' ')}
                  style={{ top, height: `${hourHeight}px` }}
                />
              );
            })}
          </div>

          {/* 계획 block */}

          {/* 현재 시간 indicator */}
          {isToday && nowTop >= 0 && nowTop <= gridHeight && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-10"
              style={{ top: nowTop }}
            >
              <div className="h-0 border-t-2 border-primary-700" />
              <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-primary-700" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default PlannerGrid;
