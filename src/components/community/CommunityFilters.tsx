'use client';

import SubjectCombobox from './SubjectCombobox';
import Image from 'next/image';
import DemographicSelect from './DemographicSelect';
import GroupSizeSelect from './GroupSizeSelect';

interface CommunityFilterProps {
  value: {
    q?: string;
    subjects?: string[];
    demographics?: string;
    groupSize?: string;
  };
  onChange: (next: Partial<CommunityFilterProps['value']>) => void;
}

function CommunityFilters({ value, onChange }: CommunityFilterProps) {
  const { q = '', subjects = [], demographics = '', groupSize = '' } = value;

  return (
    <div className="w-full md:w-2/3 flex flex-col gap-3 mx-auto">
      <div className="flex flex-col gap-2">
        <label htmlFor="search-title" className="text-xs">
          제목 검색
        </label>
        <div className="w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus-within:ring-2 focus-within:ring-secondary-400 flex justify-between items-center">
          <input
            id="search-title"
            type="search"
            placeholder="스터디 모집 글 제목 검색"
            className="w-11/12 outline-none"
            value={q}
            onChange={(e) => onChange({ q: e.target.value })}
          />
          <button type="button" aria-label="검색" className="cursor-pointer">
            <Image
              src="/icon/community/search-black.svg"
              alt=""
              width={12}
              height={12}
              unoptimized
              priority={false}
            />
          </button>
        </div>
      </div>
      <SubjectCombobox
        value={subjects}
        onChange={(v) => {
          const normalized = Array.isArray(v) ? v : [v];
          onChange({ subjects: normalized });
        }}
        allowMultiSelect={true}
      />
      <div className="w-full flex gap-4">
        <DemographicSelect
          value={demographics}
          onChange={(v) => onChange({ demographics: v })}
          className="w-1/2"
        />
        <GroupSizeSelect
          value={groupSize}
          onChange={(v) => onChange({ groupSize: v })}
          className="w-1/2"
        />
      </div>
    </div>
  );
}
export default CommunityFilters;
