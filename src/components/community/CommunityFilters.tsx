'use client';

import { useState } from 'react';
import SubjectCombobox from './SubjectCombobox';
import Image from 'next/image';
import DemographicSelect from './DemographicSelect';
import GroupSizeSelect from './GroupSizeSelect';

function CommunityFilters() {
  const [subject, setSubject] = useState<string[]>([]);
  const [demographics, setDemographics] = useState<string>('');
  const [groupSize, setGroupSize] = useState<string>('');

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
          />
          <button type="button" className="cursor-pointer">
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
        value={subject}
        onChange={(v) => {
          const normalized = Array.isArray(v) ? v : [v];
          setSubject(normalized);
        }}
        allowMultiSelect={true}
      />
      <div className="w-full flex gap-4">
        <DemographicSelect
          value={demographics}
          onChange={(v) => setDemographics(v)}
          className="w-1/2"
        />
        <GroupSizeSelect value={groupSize} onChange={(v) => setGroupSize(v)} className="w-1/2" />
      </div>
    </div>
  );
}
export default CommunityFilters;
