'use client';

import { debounce } from '@/utils/debounce';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

type Props = {
  search?: string;
  sort?: 'all' | 'public' | 'enter' | 'popular';
};

export default function SearchBar({ search: initialSearch = '', sort = 'all' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const updateUrl = useCallback(
    (keyword: string) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      if (keyword.trim()) {
        newSearchParams.set('search', keyword.trim());
      } else {
        newSearchParams.delete('search');
      }
      // 검색 시 1페이지로 리셋
      newSearchParams.set('page', '1');
      // sort 기준은 유지
      newSearchParams.set('sort', sort);
      router.push(`?${newSearchParams.toString()}`);
    },
    [router, sort, searchParams]
  );

  const debouncedUpdateUrl = useMemo(() => debounce(updateUrl, 500), [updateUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedUpdateUrl(e.target.value);
  };

  // 검색 클릭/엔터 시 디바운싱 무시하고 즉시 검색
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputRef.current) {
      debouncedUpdateUrl.cancel?.();
      updateUrl(inputRef.current.value);
    }
  };

  useEffect(() => {
    if (inputRef.current && inputRef.current.value === '') {
      inputRef.current.value = initialSearch;
    }
  }, [initialSearch]);

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 mb-20 flex max-w-lg justify-center items-center gap-2"
    >
      <div className="w-full h-auto max-w-[480px] px-4 py-2 flex justify-between rounded-2xl border-2 border-text-secondary focus-within:border-secondary-600">
        <input
          name="search"
          type="search"
          ref={inputRef}
          defaultValue={initialSearch}
          onChange={handleInputChange}
          placeholder="스터디룸 검색"
          className="text-sm outline-none px-2 flex-1"
        />
        <button type="submit" className="p-2 hover:bg-text-secondary/20 cursor-pointer rounded-xl">
          <Image src="/icon/study-room/search.svg" alt="검색 아이콘" width={20} height={20} />
        </button>
      </div>
    </form>
  );
}
