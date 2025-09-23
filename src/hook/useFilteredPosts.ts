'use client';

import { Post } from '@/@types/community';
import { useCommunityStore } from '@/stores/community.store';
import { useMemo } from 'react';

export function useFilteredPosts(totalPosts: Post[] | undefined) {
  const { query } = useCommunityStore();

  const filtered = useMemo(() => {
    if (!totalPosts) return [];
    const byTitle = query.q ? totalPosts.filter((p) => p.title.toLowerCase()) : totalPosts;
    return query.categories.length
      ? byTitle.filter((p) => query.categories.every((c) => p.categories.includes(c)))
      : byTitle;
  }, [totalPosts, query.q, query.categories]);

  const total = filtered.length;
  const start = (query.page - 1) * query.size;
  const pageItems = filtered.slice(start, start + query.size);
  const totalPages = Math.max(1, Math.ceil(total / query.size));

  return { pageItems, total, totalPages };
}
