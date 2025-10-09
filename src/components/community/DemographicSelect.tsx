'use client';

import tw from '@/utils/tw';
import Image from 'next/image';

interface DemographicProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  options?: string[];
  className?: string;
}

function DemographicSelect({
  label = '연령대',
  value,
  onChange,
  disabled,
  placeholder = '연령대 선택...',
  options = [],
  className,
}: DemographicProps) {
  const hasValue = value !== '';
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
  };

  return (
    <label htmlFor="demography-select" className={tw('flex flex-col gap-2', className)}>
      <span className="text-xs">{label}</span>
      <div className="relative">
        <select
          id="demography-select"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-400 appearance-none',
            value === '' ? 'text-gray-500/80' : 'text-text-primary',
          ].join(' ')}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {
          // 값이 없으면 드롭다운, 값이 있으면 초기화 X 버튼
          !hasValue || disabled ? (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none select-none">
              <Image
                src="/icon/angle-small-down.svg"
                alt=""
                width={16}
                height={16}
                unoptimized
                priority={false}
              />
            </span>
          ) : (
            <button
              type="button"
              aria-label="선택 초기화"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
            >
              <Image
                src="/icon/study-room/close.svg"
                alt=""
                width={16}
                height={16}
                unoptimized
                priority={false}
              />
            </button>
          )
        }
      </div>
    </label>
  );
}
export default DemographicSelect;
