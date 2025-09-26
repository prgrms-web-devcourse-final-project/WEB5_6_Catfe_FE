import { CommentTree, Post } from '@/@types/community';
import { mockPosts } from '@/lib/mockPosts';
import { keepPreviousData, QueryKey, useQuery, UseQueryResult } from '@tanstack/react-query';
import { PostQueryParams } from './usePostSearchUrl';

export const communityQueryKey = {
  all: () => ['community', 'posts'] as const,
  post: (id: string) => ['community', 'post', id] as const,
  comments: (id: string) => ['community', 'comments', id] as const,
};

export interface PostsResponse {
  posts: Post[];
  totalCount: number;
  totalPages: number;
}

export function usePostsQuery(params: PostQueryParams) {
  const { q, page, size, subjects, demographic, groupSize } = params;
  const queryKey: QueryKey = [
    ...communityQueryKey.all(),
    q,
    page,
    size,
    subjects,
    demographic,
    groupSize,
  ];

  const result = useQuery<PostsResponse, Error>({
    queryKey,
    // !! 임시 코드 : API_SERVICE.get(params) 로 나중에 변경 필요
    queryFn: async () => {
      const all = await mockPosts.getAllPosts();
      const normKeyword = (s: string) => s.normalize('NFC').toLowerCase().trim();
      let filtered = all;

      if (q) filtered = filtered.filter((p) => normKeyword(p.title).includes(normKeyword(q)));
      if (subjects.length > 0)
        filtered = filtered.filter((p) => subjects.includes(p.categories[0]));
      if (demographic) filtered = filtered.filter((p) => p.categories[1] === demographic);
      if (groupSize) filtered = filtered.filter((p) => p.categories[2] === groupSize);

      const totalCount = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / size));
      const start = (page - 1) * size;
      const pageItems = filtered.slice(start, start + size);

      return {
        posts: pageItems,
        totalCount,
        totalPages,
      };
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  return result as UseQueryResult<PostsResponse, Error> & { isPreviousData: boolean };
}

export function usePost(id: string) {
  return useQuery<Post | null>({
    queryKey: communityQueryKey.post(id || 'new'),
    // api 붙이기 전 임시 더미데이터 불러오기 코드
    queryFn: async (): Promise<Post | null> => {
      if (!id) return null;
      const result = await mockPosts.getPost(id);
      return result || null;
    },
    staleTime: 60_000,
    enabled: !!id,
  });
}

export function useComments(postId: string) {
  return useQuery<CommentTree>({
    queryKey: communityQueryKey.comments(postId),
    // api 붙이기 전 임시 더미데이터 불러오기 코드
    queryFn: () => mockPosts.getComments(postId),
    staleTime: 60_000,
  });
}
