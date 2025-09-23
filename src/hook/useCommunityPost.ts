import { CommentTree, Post } from '@/@types/community';
import { mockPosts } from '@/lib/mockPosts';
import { useQuery } from '@tanstack/react-query';

export const communityQueryKey = {
  all: () => ['community', 'posts'] as const,
  post: (id: string) => ['community', 'post', id] as const,
  comments: (id: string) => ['community', 'comments', id] as const,
};

export function useAllPostsQuery() {
  return useQuery<Post[]>({
    queryKey: communityQueryKey.all(),
    queryFn: () => mockPosts.getAllPosts(),
    staleTime: 60_000,
  });
}

export function usePost(id: string) {
  return useQuery<Post | undefined>({
    queryKey: communityQueryKey.post(id),
    // api 붙이기 전 임시 더미데이터 불러오기 코드
    queryFn: () => mockPosts.getPost(id),
    staleTime: 60_000,
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
