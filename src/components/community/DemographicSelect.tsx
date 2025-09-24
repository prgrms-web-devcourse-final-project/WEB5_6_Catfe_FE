'use client';

import { ALL_CATEGORIES } from '@/lib/communityCategories';
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
  options = ALL_CATEGORIES.demographics as unknown as string[],
  className,
}: DemographicProps) {
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
          <option value="" disabled selected hidden>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
      </div>
    </label>
  );
}
export default DemographicSelect;
