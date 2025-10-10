'use client';

import PostFilters from '@/components/community/PostFilters';
import CommunityTab from '@/components/community/CommunityTab';
import PostCard from '@/components/community/PostCard';
import Pagination from '@/components/Pagination';
import { useCategoriesQuery, usePostsQuery } from '@/hook/useCommunityPost';
import { PostSort, usePostSearchUrl } from '@/hook/usePostSearchUrl';
import Image from 'next/image';
import { useMemo } from 'react';
import Spinner from '@/components/Spinner';

const SORT_OPTIONS: { label: string; value: PostSort }[] = [
  { label: '최신순', value: 'createdAt,desc' },
  { label: '오래된순', value: 'createdAt,asc' },
  { label: '좋아요순', value: 'likeCount,desc' },
  { label: '댓글순', value: 'commentCount,desc' },
];

function CommunityListClient() {
  const { query, push, replaceSort } = usePostSearchUrl();
  const { data: categoryData, isLoading: isLoadingCategories } = useCategoriesQuery();

  const categoryNameToIdMap = useMemo(() => {
    if (!categoryData) return {};
    return categoryData.reduce(
      (acc, category) => {
        acc[category.name] = category.id;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [categoryData]);

  const { data, isLoading, isPreviousData } = usePostsQuery(query, categoryNameToIdMap);

  const pageItems = data?.posts ?? [];
  const totalPages = data?.totalPages ?? 1;

  const isFetching = isLoading || isPreviousData;

  const pageSize = query.size;

  if (isLoadingCategories) return <Spinner className="h-dvh" />;

  return (
    <div className="max-w-[1200px] flex flex-col justify-start items-start gap-6 sm:gap-10 px-10 py-8 sm:px-[100px] sm:pb-[60px]">
      <CommunityTab />
      <header className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-3 sm:gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">스터디 그룹 탐색</h2>
          <p className="text-base sm:text-lg">함께 공부할 스터디 그룹을 찾아보세요!</p>
        </div>
        <div className="w-11 h-12 sm:w-18 sm:h-20 relative">
          <Image
            src="/image/cat-default.svg"
            alt=""
            fill
            sizes="(max-width: 110px)"
            className="h-full w-full object-cover"
            priority={false}
          />
        </div>
      </header>
      <PostFilters
        value={query}
        onChange={(next) => push({ ...next, page: 1 })}
        categoryData={categoryData || []}
      />
      <div className="w-full flex justify-end items-center gap-3">
        <span className="text-sm text-text-secondary">정렬 : </span>
        <select
          id="community-sort"
          value={query.sort}
          onChange={(e) => replaceSort(e.target.value as PostSort)}
          className="border border-zinc-300 rounded-md p-1 text-sm outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
        {/* loading skeleton */}
        {isFetching
          ? Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-gray-400 animate-pulse" />
            ))
          : pageItems.map((post) => <PostCard key={post.postId} post={post} />)}
        {/* data가 없을 경우 */}
        {!isFetching && pageItems.length === 0 && (
          <div className="col-span-full text-center py-10 text-text-secondary">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
      <div className="mx-auto mt-6">
        <Pagination
          defaultPage={query.page}
          totalPages={totalPages}
          onPageChange={(p) => push({ page: p })}
        />
      </div>
    </div>
  );
}
export default CommunityListClient;
