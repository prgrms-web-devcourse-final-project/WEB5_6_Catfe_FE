/* Community Post 테스트용 더미데이터 */
// lib/mockPosts.ts
import type { Post, CommentTree, RootComment, ReplyComment, UserSummary } from '@/@types/community';

const user1: UserSummary = {
  user_id: 'u1',
  nickname: 'Alice',
  profile_image_url: '@/assets/cats/cat-1.svg',
};

const user2: UserSummary = {
  user_id: 'u2',
  nickname: 'Bob',
  profile_image_url: '@/assets/cats/cat-2.svg',
};

const posts: Post[] = [
  {
    post_id: 'p1',
    author: user1,
    title: '첫 번째 게시글',
    content: 'Tiptap JSON 대신 지금은 문자열로 저장된 더미 content',
    categories: ['프론트엔드', '직장인', '10명'],
    likeCount: 3,
    commentCount: 2,
    isLikedByMe: true,
    isBookmarkedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const comments: CommentTree = [
  {
    comment_id: 'c1',
    post_id: 'p1',
    author: user2,
    content: '좋은 글 감사합니다!',
    likeCount: 1,
    isLikedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 1,
    children: [
      {
        comment_id: 'c2',
        post_id: 'p1',
        author: user1,
        content: '읽어주셔서 감사해요 🙏',
        likeCount: 0,
        isLikedByMe: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentCommentId: 'c1',
      } as ReplyComment,
    ],
  } as RootComment,
];

export const mockPosts = {
  async getPost(id: string): Promise<Post | undefined> {
    return posts.find((p) => p.post_id === id);
  },
  async getComments(postId: string): Promise<CommentTree> {
    return comments.filter((c) => c.post_id === postId);
  },
};
