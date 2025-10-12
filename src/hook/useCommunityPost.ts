import {
  CategoriesResponse,
  CategoryItem,
  CategoryType,
  CommentsResponse,
  CreatePostRequest,
  PostDetail,
  PostListItem,
  PostListResponse,
} from '@/@types/community';
import {
  keepPreviousData,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { PostQueryParams, PostSort } from './usePostSearchUrl';
import api from '@/utils/api';
import { ApiResponse } from '@/@types/type';

/* ------ QueryKey ------ */
export const communityQueryKey = {
  all: () => ['community', 'posts'] as const,
  post: (id: number) => ['community', 'post', id] as const,
  comments: (id: number, page: number = 0, size: number = 10, sort: string = 'createdAt,desc') =>
    ['community', 'comments', id, { page, size, sort }] as const,
  categories: () => ['community', 'categories'] as const,
};

/* ------ Post ------ */
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
    enabled: isMapReady,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  return result as UseQueryResult<PostsResponse, Error> & { isPreviousData: boolean };
}

export function usePost(id: number) {
  return useQuery<PostDetail | null>({
    queryKey: communityQueryKey.post(id || 0),
    queryFn: async (): Promise<PostDetail | null> => {
      if (!id) return null;
      const { data: response } = await api.get<ApiResponse<PostDetail>>(`/api/posts/${id}`);
      if (!response.success) throw new Error(response.message || '게시글 불러오기에 실패했습니다.');
      return response.data || null;
    },
    staleTime: 60_000,
    enabled: !!id,
  });
}

export function usePostMutations(isEditMode: boolean, existingPostId?: number) {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<PostDetail>, Error, CreatePostRequest>({
    mutationFn: async (data: CreatePostRequest) => {
      try {
        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode ? `/api/posts/${existingPostId}` : `/api/posts`;
        const { data: response } = await api.request<ApiResponse<PostDetail>>({
          url,
          method,
          data,
        });
        if (!response.success) throw new Error(response.message || '게시글 저장에 실패했습니다.');

        return response;
      } catch (error) {
        throw new Error((error as Error).message || '알 수 없는 오류가 발생했습니다.');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: communityQueryKey.all() });
      if (data.data.postId) {
        queryClient.invalidateQueries({ queryKey: communityQueryKey.post(data.data.postId) });
      }
    },
  });
}

export async function apiDeletePost(postId: number): Promise<void> {
  const { data: response } = await api.delete<ApiResponse<void>>(`/api/posts/${postId}`);
  if (!response.success) throw new Error(`DELETE post ${postId} failed: ${response.message};`);
}

export async function getPostDetail(id: number): Promise<PostDetail | null> {
  if (id === 0) return null;
  try {
    const { data: response } = await api.get<ApiResponse<PostDetail>>(`/api/posts/${id}`);
    if (!response.success) throw new Error(response.message || '게시글 불러오기에 실패했습니다.');
    return response.data || null;
  } catch (error) {
    console.error(`Fetch Error - Post Detail for Server: ${id}`, error);
    return null;
  }
}

/* ------ Comments ------ */
export function useComments(
  postId: number,
  page: number = 0,
  size: number = 10,
  sort: string = 'createdAt,desc'
) {
  return useQuery<CommentsResponse>({
    queryKey: communityQueryKey.comments(postId, page, size, sort),
    queryFn: async (): Promise<CommentsResponse> => {
      const url = `/api/posts/${postId}/comments?page=${page}&size=${size}&sort=${sort}`;
      const response = await api.get<CommentsResponse>(url);
      return response.data;
    },
    staleTime: 60_000,
    enabled: !!postId,
  });
}

/* ------ Categories ------ */
export interface RegisterCategoryRequest {
  name: string;
  type: CategoryType;
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

export function useCategoryRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation<number, Error, RegisterCategoryRequest>({
    mutationFn: async (data: RegisterCategoryRequest) => {
      const { data: response } = await api.post<ApiResponse<CategoryItem>>(
        '/api/posts/categories',
        data
      );

      if (!response.success) throw new Error(response.message || '카테고리 등록에 실패했습니다.');
      return response.data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityQueryKey.categories() });
    },
    onError: (error) => {
      console.error('카테고리 등록 오류:', error);
    },
  });
}
