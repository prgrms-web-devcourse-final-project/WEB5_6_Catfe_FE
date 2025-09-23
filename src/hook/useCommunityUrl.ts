'use client';

import { useCommunityStore } from '@/stores/community.store';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function useCommunityUrl() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const { query, set } = useCommunityStore(useShallow((s) => ({ query: s.query, set: s.set })));

  useEffect(() => {
    const q = params.get('q') ?? '';
    const page = Math.max(1, Number(params.get('page') ?? 1));
    const categories = params.getAll('categories');
    set({ q, page, categories });
  }, [params, set]);

  const push = (next: Partial<typeof query>) => {
    const merged = { ...query, ...next };
    const searchParam = new URLSearchParams();
    if (merged.q) searchParam.set('q', merged.q);
    merged.categories.forEach((c) => searchParam.append('category', c));
    searchParam.set('page', String(merged.page));
    router.replace(`${pathname}?${searchParam.toString()}`, { scroll: false });
  };

  return { query, push };
}
