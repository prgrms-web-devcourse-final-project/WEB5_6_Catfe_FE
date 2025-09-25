'use client';

import SubjectCombobox from './SubjectCombobox';
import Image from 'next/image';
import DemographicSelect from './DemographicSelect';
import GroupSizeSelect from './GroupSizeSelect';
import { useEffect, useRef, useState } from 'react';

interface PostFilterProps {
  value: {
    q?: string;
    subjects?: string[];
    demographic?: string;
    groupSize?: string;
  };
  onChange: (next: Partial<PostFilterProps['value']>) => void;
}

function PostFilters({ value, onChange }: PostFilterProps) {
  const { q = '', subjects = [], demographic = '', groupSize = '' } = value;

  const [draft, setDraft] = useState<string>(q);
  const composingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 사용자가 입력 중이지 않을 때만 동기화
  useEffect(() => {
    if (!composingRef.current) {
      setDraft(q);
    }
  }, [q]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDraft(value);
    clearTimer();

    timerRef.current = setTimeout(() => {
      composingRef.current = false;
      onChange({ q: value });
      timerRef.current = null;
    }, 250);
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
    clearTimer();
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    clearTimer();
    composingRef.current = false;
    const value = (e.target as HTMLInputElement).value;
    setDraft(value);
    onChange({ q: value });
  };

  const handleClick = () => {
    clearTimer();
    onChange({ q: draft });
  };

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
            value={draft}
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            inputMode="search"
          />
          <button type="button" aria-label="검색" className="cursor-pointer" onClick={handleClick}>
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
        allowCustom={false}
      />
      <div className="w-full flex gap-4">
        <DemographicSelect
          value={demographic}
          onChange={(v) => onChange({ demographic: v })}
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
export default PostFilters;
