/* Community Post 테스트용 더미데이터 */
// lib/mockPosts.ts
import type { Post, CommentTree, RootComment, ReplyComment, UserSummary } from '@/@types/community';
import Cat1 from '@/assets/cats/cat-1.svg';
import Cat2 from '@/assets/cats/cat-2.svg';
import Cat3 from '@/assets/cats/cat-3.svg';
import Cat4 from '@/assets/cats/cat-4.svg';

const user1: UserSummary = {
  user_id: 'u1',
  nickname: 'Alice',
  profile_image_url: Cat1,
};

const user2: UserSummary = {
  user_id: 'u2',
  nickname: 'Bob',
  profile_image_url: Cat2,
};

const user3: UserSummary = {
  user_id: 'u3',
  nickname: 'Charlie',
  profile_image_url: Cat3,
};

const user4: UserSummary = {
  user_id: 'u4',
  nickname: 'Dana',
  profile_image_url: Cat4,
};

const posts: Post[] = [
  {
    post_id: 'p1',
    author: user1,
    title: '첫 번째 게시글',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '본문 내용입니다.' }],
        },
      ],
    },
    categories: ['프론트엔드', '직장인'],
    likeCount: 3,
    commentCount: 2,
    isLikedByMe: true,
    isBookmarkedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    post_id: 'p2',
    author: user2,
    title: '댓글 없는 게시글',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { textAlign: null, level: 2 },
          content: [{ type: 'text', text: '안녕하세요' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '댓글이 하나도 없는 게시글입니다.' }],
        },
      ],
    },
    categories: ['백엔드', '취준생'],
    likeCount: 0,
    commentCount: 0,
    isLikedByMe: false,
    isBookmarkedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    post_id: 'p3',
    author: user3,
    title: '댓글 많은 게시글',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '여기에 댓글이 많이 달립니다.' }],
        },
      ],
    },
    categories: ['CS', '스터디'],
    likeCount: 5,
    commentCount: 4,
    isLikedByMe: false,
    isBookmarkedByMe: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    post_id: 'p4',
    author: user4,
    title: '오늘 개발자 모임 후기',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '재밌는 분들을 많이 만났어요!' }],
        },
      ],
    },
    categories: ['네트워킹', '오프라인'],
    likeCount: 8,
    commentCount: 3,
    isLikedByMe: false,
    isBookmarkedByMe: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    post_id: 'p5',
    author: user2,
    title: 'Next.js Router v7 후기',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { textAlign: null, level: 3 },
          content: [{ type: 'text', text: '새 버전 체감' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '개선된 점들이 많네요.' }],
        },
      ],
    },
    categories: ['프론트엔드', 'React'],
    likeCount: 2,
    commentCount: 0,
    isLikedByMe: false,
    isBookmarkedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    post_id: 'p6',
    author: user3,
    title: '스터디원 모집합니다',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: 'CS 스터디 같이 하실 분?' }],
        },
      ],
    },
    categories: ['스터디', 'CS'],
    likeCount: 10,
    commentCount: 5,
    isLikedByMe: true,
    isBookmarkedByMe: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    post_id: 'p7',
    author: user1,
    title: '퇴근하고 뭐 하세요?',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '저는 운동하면서 스트레스 풉니다.' }],
        },
      ],
    },
    categories: ['자유', '직장인'],
    likeCount: 1,
    commentCount: 1,
    isLikedByMe: false,
    isBookmarkedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    post_id: 'p8',
    author: user2,
    title: 'Supabase Edge Function 써본 후기',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: 'JWT 검증 부분이 꽤 편리했음.' }],
        },
      ],
    },
    categories: ['백엔드', 'Supabase'],
    likeCount: 4,
    commentCount: 2,
    isLikedByMe: true,
    isBookmarkedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    post_id: 'p9',
    author: user4,
    title: '주말 여행 추천해주세요',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '서울 근교 드라이브 갈만한 곳 있을까요?' }],
        },
      ],
    },
    categories: ['자유', '여행'],
    likeCount: 0,
    commentCount: 0,
    isLikedByMe: false,
    isBookmarkedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const comments: CommentTree = [
  // p1 - 루트 + 답글 1개
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

  // p3 - 루트 댓글 여러 개
  {
    comment_id: 'c3',
    post_id: 'p3',
    author: user1,
    content: '와 이거 정말 유익하네요',
    likeCount: 2,
    isLikedByMe: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 0,
    children: [],
  } as RootComment,
  {
    comment_id: 'c4',
    post_id: 'p3',
    author: user2,
    content: '질문 있는데 DM 가능할까요?',
    likeCount: 0,
    isLikedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 1,
    children: [
      {
        comment_id: 'c5',
        post_id: 'p3',
        author: user3,
        content: '네 DM 주세요!',
        likeCount: 0,
        isLikedByMe: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentCommentId: 'c4',
      } as ReplyComment,
    ],
  } as RootComment,
  {
    comment_id: 'c6',
    post_id: 'p3',
    author: user4,
    content: '저도 같은 부분이 궁금했어요',
    likeCount: 1,
    isLikedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 0,
    children: [],
  } as RootComment,
  // p4 - 댓글 여러 개
  {
    comment_id: 'c7',
    post_id: 'p4',
    author: user1,
    content: '와 모임 재밌었겠네요!',
    likeCount: 2,
    isLikedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 0,
    children: [],
  } as RootComment,
  {
    comment_id: 'c8',
    post_id: 'p4',
    author: user3,
    content: '저도 참석하고 싶었는데 못 갔어요 😢',
    likeCount: 1,
    isLikedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 1,
    children: [
      {
        comment_id: 'c9',
        post_id: 'p4',
        author: user4,
        content: '다음에 꼭 오세요!',
        likeCount: 0,
        isLikedByMe: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentCommentId: 'c8',
      } as ReplyComment,
    ],
  } as RootComment,

  // p6 - 댓글 많이
  {
    comment_id: 'c10',
    post_id: 'p6',
    author: user2,
    content: '저 참여하고 싶어요!',
    likeCount: 3,
    isLikedByMe: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 0,
    children: [],
  } as RootComment,
  {
    comment_id: 'c11',
    post_id: 'p6',
    author: user4,
    content: '스터디 주제는 어떤 건가요?',
    likeCount: 1,
    isLikedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 1,
    children: [
      {
        comment_id: 'c12',
        post_id: 'p6',
        author: user3,
        content: '운영체제/네트워크 중심입니다!',
        likeCount: 2,
        isLikedByMe: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentCommentId: 'c11',
      } as ReplyComment,
    ],
  } as RootComment,

  // p7 - 댓글 1개만
  {
    comment_id: 'c13',
    post_id: 'p7',
    author: user3,
    content: '저는 독서하면서 쉬어요 📚',
    likeCount: 0,
    isLikedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 0,
    children: [],
  } as RootComment,

  // p8 - 댓글 2개
  {
    comment_id: 'c14',
    post_id: 'p8',
    author: user1,
    content: '엣지 함수 배워보고 싶네요',
    likeCount: 0,
    isLikedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 0,
    children: [],
  } as RootComment,
  {
    comment_id: 'c15',
    post_id: 'p8',
    author: user4,
    content: '도입하기 어렵지 않나요?',
    likeCount: 1,
    isLikedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentCommentId: null,
    replyCount: 0,
    children: [],
  } as RootComment,
];

export const mockPosts = {
  async getPost(id: string): Promise<Post | undefined> {
    // 네트워크 지연 흉내
    await new Promise((r) => setTimeout(r, 200));
    return posts.find((p) => p.post_id === id);
  },
  async getComments(postId: string): Promise<CommentTree> {
    // 네트워크 지연 흉내
    await new Promise((r) => setTimeout(r, 200));
    return comments.filter((c) => c.post_id === postId);
  },
  async getAllPosts(): Promise<Post[]> {
    // 네트워크 지연 흉내
    await new Promise((r) => setTimeout(r, 200));
    return posts;
  },
};
