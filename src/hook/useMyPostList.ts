import { MyPostListDto, MyPostListPageResponse, MyPostListQuery } from '@/@types/community';
import { apiGetMyBookmarks, apiGetMyPosts } from '@/api/apiMyPosts';
import { keepPreviousData, useQuery, UseQueryResult } from '@tanstack/react-query';

export const myPostQueryKeys = {
  myPosts: (query: MyPostListQuery) => ['myPosts', query] as const,
  myBookmarks: (query: MyPostListQuery) => ['myBookmarks', query] as const,
};

export type PostListHookResult = UseQueryResult<MyPostListPageResponse, Error> & {
  pageItems: MyPostListDto[];
  totalPages: number;
  isFetching: boolean;
};

// Helper: 쿼리 결과를 PostListHookResult 타입으로 변환
const usePostListQuery = (
  queryKey: readonly ['myPosts' | 'myBookmarks', MyPostListQuery],
  queryFn: (query: MyPostListQuery) => Promise<MyPostListPageResponse>,
  query: MyPostListQuery
): PostListHookResult => {
  const result = useQuery({
    queryKey,
    queryFn: () => queryFn(query),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5분
  });

  const pageItems = result.data?.items ?? [];
  const totalPages = result.data?.totalPages ?? 1;
  const isFetching = result.isLoading || result.isFetching || result.isPlaceholderData;

  return {
    ...result,
    pageItems,
    totalPages,
    isFetching,
  } as PostListHookResult;
};

/* 로그인 사용자가 작성한 게시글 목록 조회 */
export function useMyPosts(query: MyPostListQuery): PostListHookResult {
  return usePostListQuery(myPostQueryKeys.myPosts(query), apiGetMyPosts, query);
}

/* 로그인 사용자가 북마크한 게시글 목록 조회 */
export function useMyBookmark(query: MyPostListQuery): PostListHookResult {
  return usePostListQuery(myPostQueryKeys.myBookmarks(query), apiGetMyBookmarks, query);
}
