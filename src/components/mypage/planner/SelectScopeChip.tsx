import { ApplyScope } from '@/@types/planner';
import tw from '@/utils/tw';

interface SelectScopeChipProps {
  value: ApplyScope;
  onChange: (scope: ApplyScope) => void;
}

const SCOPE_OPTIONS: { value: ApplyScope; label: string }[] = [
  { value: 'THIS_ONLY', label: '이 일정만' },
  { value: 'FROM_THIS_DATE', label: '이 일정과 이후 반복 일정 모두' },
];

function SelectScopeChip({ value, onChange }: SelectScopeChipProps) {
  return (
    <div className="flex gap-2">
      {SCOPE_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={tw(
              'rounded-full px-3 py-1 text-sm sm:text-xs font-medium transition',
              selected
                ? 'text-error-500 bg-secondary-50 shadow-md'
                : 'bg-secondary-100 text-text-secondary hover:bg-secondary-100'
            )}
            aria-pressed={selected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
export default SelectScopeChip;
