/* Community Post 테스트용 더미데이터 */
// lib/mockPosts.ts
import type { Post, CommentTree, RootComment, ReplyComment, UserSummary } from '@/@types/community';
import Cat2 from '@/assets/cats/cat-2.svg';
import Cat3 from '@/assets/cats/cat-3.svg';

const user1: UserSummary = {
  user_id: 'u1',
  nickname: 'Alice',
  profile_image_url: Cat2,
};

const user2: UserSummary = {
  user_id: 'u2',
  nickname: 'Bob',
  profile_image_url: Cat3,
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
          type: 'heading',
          attrs: { textAlign: null, level: 2 },
          content: [{ type: 'text', text: 'h1' }],
        },
        {
          type: 'heading',
          attrs: { textAlign: null, level: 3 },
          content: [{ type: 'text', text: 'h2' }],
        },
        {
          type: 'heading',
          attrs: { textAlign: null, level: 4 },
          content: [{ type: 'text', text: 'h3' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '본문' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', marks: [{ type: 'bold' }], text: '굵게' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', marks: [{ type: 'italic' }], text: '이탤릭' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', marks: [{ type: 'underline' }], text: '밑줄' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', marks: [{ type: 'strike' }], text: '스트라이크' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '불렛1' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '불렛2' }],
                },
              ],
            },
          ],
        },
        {
          type: 'orderedList',
          attrs: { start: 1, type: null },
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '넘버1' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: null },
                  content: [{ type: 'text', text: '넘버2' }],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '왼쪽정렬' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: '가운데정렬' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'right' },
          content: [{ type: 'text', text: '오른쪽정렬' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            {
              type: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://google.com',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    class: null,
                  },
                },
              ],
              text: '링크',
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '이미지' }],
        },
      ],
    },
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
    // 네트워크 지연 흉내
    await new Promise((r) => setTimeout(r, 200));
    return posts.find((p) => p.post_id === id);
  },
  async getComments(postId: string): Promise<CommentTree> {
    // 네트워크 지연 흉내
    await new Promise((r) => setTimeout(r, 200));
    return comments.filter((c) => c.post_id === postId);
  },
};
