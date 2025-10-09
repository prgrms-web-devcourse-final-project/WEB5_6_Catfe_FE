import {
  CategoriesResponse,
  CategoryItem,
  CommentTree,
  PostDetail,
  PostListItem,
  PostListResponse,
  PostResponse,
} from '@/@types/community';
import { keepPreviousData, QueryKey, useQuery, UseQueryResult } from '@tanstack/react-query';
import { PostQueryParams, PostSort } from './usePostSearchUrl';
import api from '@/utils/api';

export const communityQueryKey = {
  all: () => ['community', 'posts'] as const,
  post: (id: string) => ['community', 'post', id] as const,
  comments: (id: string) => ['community', 'comments', id] as const,
  categories: () => ['community', 'categories'] as const,
};

export interface PostsResponse {
  posts: PostListItem[];
  totalCount: number;
  totalPages: number;
}

export function usePostsQuery(
  params: PostQueryParams,
  categoryNameToIdMap: Record<string, number>
) {
  const isMapReady = Object.keys(categoryNameToIdMap).length > 0;
  const { q, page, size, subjects, demographic, groupSize, sort } = params;
  const queryKey: QueryKey = [
    ...communityQueryKey.all(),
    q,
    page,
    size,
    subjects,
    demographic,
    groupSize,
    sort,
    isMapReady,
  ];

  const result = useQuery<PostsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const apiParams: {
        page: number;
        size: number;
        sort?: PostSort;
        keyword?: string;
        searchType?: string;
        category?: string;
      } = {
        page: page - 1,
        size,
        sort,
      };

      if (q) {
        apiParams.keyword = q.normalize('NFC').toLowerCase().trim();
        apiParams.searchType = 'title';
      }

      const filterNames: string[] = [];

      if (subjects.length > 0) filterNames.push(...subjects);
      if (demographic) filterNames.push(demographic);
      if (groupSize) filterNames.push(groupSize);
      const categoryIds = filterNames.map((name) => categoryNameToIdMap[name]).filter((id) => !!id);

      // category 여러개 받는 경우 어떻게 처리하는지 확인 필요
      if (categoryIds.length > 0) apiParams.category = categoryIds.join(',');

      const response = await api.get<PostListResponse>('/api/posts', {
        params: apiParams,
      });
      const apiData = response.data.data;

      return {
        posts: apiData.items,
        totalCount: apiData.totalElements,
        totalPages: apiData.totalPages,
      };
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  return result as UseQueryResult<PostsResponse, Error> & { isPreviousData: boolean };
}

export function usePost(id: string) {
  return useQuery<PostDetail | null>({
    queryKey: communityQueryKey.post(id || 'new'),
    queryFn: async (): Promise<PostDetail | null> => {
      if (!id) return null;
      const response = await api.get<PostResponse>(`/api/posts/${id}`);
      return response.data.data || null;
    },
    staleTime: 60_000,
    enabled: !!id,
  });
}

export function useComments(postId: string) {
  return useQuery<CommentTree>({
    queryKey: communityQueryKey.comments(postId),
    queryFn: async (): Promise<CommentTree> => {
      const response = await api.get<CommentTree>(`/api/posts/${postId}/comments`);
      return response.data;
    },
    staleTime: 60_000,
    enabled: !!postId,
  });
}

export function useCategoriesQuery() {
  return useQuery<CategoryItem[], Error>({
    queryKey: communityQueryKey.categories(),
    queryFn: async () => {
      const response = await api.get<CategoriesResponse>('/api/posts/categories');
      return response.data.data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
