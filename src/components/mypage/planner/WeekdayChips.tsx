import { DayOfWeekEnum } from '@/@types/planner';

function WeekdayChips({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: DayOfWeekEnum;
  onChange: (v: DayOfWeekEnum) => void;
}) {
  const DAYS: Array<{ code: DayOfWeekEnum; label: string }> = [
    { code: 'SUN', label: '일' },
    { code: 'MON', label: '월' },
    { code: 'TUE', label: '화' },
    { code: 'WED', label: '수' },
    { code: 'THU', label: '목' },
    { code: 'FRI', label: '금' },
    { code: 'SAT', label: '토' },
  ];
  return (
    <div className="flex flex-wrap gap-2" id={id}>
      {DAYS.map((day) => {
        const active = value.includes(day.code);
        return (
          <button
            key={day.code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(day.code)}
            className={
              active
                ? 'rounded-full px-3 py-1 text-xs border bg-white'
                : 'rounded-full px-3 py-1 text-xs border bg-secondary-600 border-secondary-700'
            }
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
export default WeekdayChips;
