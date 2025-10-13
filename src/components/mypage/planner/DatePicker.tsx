'use client';

import {
  addDays,
  formatKoreanYearMonth,
  formatToYMD,
  fromYMD,
  getWeekDays,
  isSameDay,
} from '@/lib/datetime';
import tw from '@/utils/tw';
import DateNavButton from './DateNavButton';

interface DatePickerProps {
  value: Date;
  onChange: (next: Date) => void;
  className?: string;
}

const EN_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DatePicker({ value, onChange, className }: DatePickerProps) {
  const week = getWeekDays(value, 1); // 월요일(1)부터 일주일 count
  const ymd = formatToYMD(value);

  const WeekNavigation = (
    <>
      <DateNavButton dir="prev" onClick={() => onChange(addDays(week[0], -7))} />
      <ul className="flex flex-1 items-center justify-between gap-2">
        {week.map((date) => {
          const selected = isSameDay(date, value);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          return (
            <li key={formatToYMD(date)} className="flex-1">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(date)}
                className={[
                  'w-full rounded-lg px-3 py-2 text-center transition',
                  'border-none hover:border-neutral-500 cursor-pointer',
                  selected && 'bg-primary-200 text-primary-600',
                  !selected && 'bg-transparent',
                  isWeekend && !selected && 'text-text-secondary',
                ].join(' ')}
              >
                <div className="text-base font-semibold">{date.getDate()}</div>
                <div className="text-xs opacity-70 font-light">{EN_WEEK[date.getDay()]}</div>
              </button>
            </li>
          );
        })}
      </ul>
      <DateNavButton dir="next" onClick={() => onChange(addDays(week[0], +7))} />
    </>
  );
  return (
    <div className={tw('flex flex-col gap-3', className)}>
      {/* 1. XL 사이즈 이상에서만 보이는 통합된 단일 행 레이아웃 */}
      <div className="hidden xl:flex items-center gap-4 2xl:gap-10 w-full">
        <h3 className="text-xl font-semibold xl:order-1">{formatKoreanYearMonth(value)}</h3>
        <div className="flex flex-1 items-center justify-between gap-2 xl:order-2">
          {WeekNavigation}
        </div>
        <div className="flex gap-2 xl:order-3">
          <button
            className="rounded border border-zinc-500 px-2 py-1 text-sm bg-secondary-50 hover:bg-secondary-100 cursor-pointer"
            onClick={() => onChange(fromYMD(formatToYMD(new Date()))!)}
          >
            오늘로 이동
          </button>
          <label htmlFor="pick-date-lg" className="sr-only">
            특정 날짜로 이동
          </label>
          <input
            type="date"
            id="pick-date-lg"
            value={ymd}
            onChange={(e) => {
              const d = fromYMD(e.target.value);
              if (d) onChange(d);
            }}
            className="rounded-md border border-zinc-500 bg-background-white px-3 py-1 text-sm outline-none"
            aria-label="특정 날짜 선택"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LG 사이즈 미만에서만 보이는 2단 구성 레이아웃 */}
      <div className="xl:hidden flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">{formatKoreanYearMonth(value)}</h3>
          <div className="ml-auto flex gap-2">
            <button
              className="rounded border border-zinc-500 px-2 py-1 text-sm bg-secondary-50 hover:bg-secondary-100 cursor-pointer"
              onClick={() => onChange(fromYMD(formatToYMD(new Date()))!)}
            >
              오늘로 이동
            </button>
            <label htmlFor="pick-date" className="sr-only">
              특정 날짜로 이동
            </label>
            <input
              type="date"
              id="pick-date"
              value={ymd}
              onChange={(e) => {
                const d = fromYMD(e.target.value);
                if (d) onChange(d);
              }}
              className="rounded-md border border-zinc-500 bg-background-white px-3 py-1 text-sm outline-none"
              aria-label="특정 날짜 선택"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">{WeekNavigation}</div>
      </div>
    </div>
  );
}
export default DatePicker;
