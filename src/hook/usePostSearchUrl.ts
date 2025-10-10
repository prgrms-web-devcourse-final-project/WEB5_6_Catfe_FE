'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export type PostSort = 'createdAt,desc' | 'createdAt,asc' | 'likeCount,desc' | 'commentCount,desc';

export interface PostQueryParams {
  q: string;
  subjects: string[];
  demographic: string;
  groupSize: string;
  page: number;
  size: number;
  sort: PostSort;
}

const DEFAULT_PAGE_SIZE = 6;
const DEFAULT_SORT: PostSort = 'createdAt,desc';

export function usePostSearchUrl() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  // URL에서 검색 쿼리 & 조건 추출
  const query: PostQueryParams = useMemo(() => {
    const q = (params.get('q') ?? '').normalize('NFC').trim();
    const page = Math.max(1, Number(params.get('page') ?? 1));
    const size = DEFAULT_PAGE_SIZE;

    const subjects = params.getAll('subject') ?? [];
    const demographic = params.get('demographic') ?? '';
    const groupSize = params.get('group') ?? '';
    const sort = (params.get('sort') as PostSort) ?? DEFAULT_SORT;

    return { q, page, size, subjects, demographic, groupSize, sort };
  }, [params]);

  // 새로운 쿼리 상태로 URL 업데이트
  const push = (next: Partial<PostQueryParams>, opts?: { scroll?: boolean }) => {
    const merged = { ...query, ...next };

    // url에 append
    const searchParam = new URLSearchParams();
    if (merged.q) searchParam.set('q', merged.q);
    for (const s of merged.subjects ?? []) searchParam.append('subject', s);
    if (merged.demographic) searchParam.set('demographic', merged.demographic);
    if (merged.groupSize) searchParam.set('group', merged.groupSize);
    searchParam.set('page', String(merged.page));
    if (merged.sort !== DEFAULT_SORT) searchParam.set('sort', merged.sort);

    const qs = searchParam.toString();

    router.replace(`${pathname}?${qs}`, { scroll: opts?.scroll ?? false });
  };

  const replaceFilters = (partial: Partial<Omit<PostQueryParams, 'page' | 'size'>>) =>
    push({ ...partial, page: 1 });

  const replaceSort = (sort: PostSort) => push({ sort, page: 1 });

  return { query, push, replaceFilters, replaceSort };
}
