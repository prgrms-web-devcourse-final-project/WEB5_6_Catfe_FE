/* Community Post 테스트용 더미데이터 */
import type { Post, CommentTree, RootComment, ReplyComment, UserSummary } from '@/@types/community';

import Cat1 from '@/assets/cats/cat-1.svg';
import Cat2 from '@/assets/cats/cat-2.svg';
import Cat3 from '@/assets/cats/cat-3.svg';
import Cat4 from '@/assets/cats/cat-4.svg';
import Cat5 from '@/assets/cats/cat-5.svg';
import Cat6 from '@/assets/cats/cat-6.svg';
import Cat7 from '@/assets/cats/cat-7.svg';
import Cat8 from '@/assets/cats/cat-8.svg';
import Cat9 from '@/assets/cats/cat-9.svg';
import Cat10 from '@/assets/cats/cat-10.svg';
import Cat11 from '@/assets/cats/cat-11.svg';
import Cat12 from '@/assets/cats/cat-12.svg';
import Cat13 from '@/assets/cats/cat-13.svg';
import Cat14 from '@/assets/cats/cat-14.svg';
import Cat15 from '@/assets/cats/cat-15.svg';
import Cat16 from '@/assets/cats/cat-16.svg';

// ────────────────────────────────────────────
// Users
export const users: UserSummary[] = [
  { userId: 1, nickname: 'Alice', profileImageUrl: Cat1 },
  { userId: 2, nickname: 'Bob', profileImageUrl: Cat2 },
  { userId: 3, nickname: 'Charlie', profileImageUrl: Cat3 },
  { userId: 4, nickname: 'Dana', profileImageUrl: Cat4 },
  { userId: 5, nickname: 'Eden', profileImageUrl: Cat5 },
  { userId: 6, nickname: 'Finn', profileImageUrl: Cat6 },
  { userId: 7, nickname: 'Grace', profileImageUrl: Cat7 },
  { userId: 8, nickname: 'Hugh', profileImageUrl: Cat8 },
  { userId: 9, nickname: 'Iris', profileImageUrl: Cat9 },
  { userId: 10, nickname: 'Juno', profileImageUrl: Cat10 },
  { userId: 11, nickname: 'Kane', profileImageUrl: Cat11 },
  { userId: 12, nickname: 'Lia', profileImageUrl: Cat12 },
  { userId: 13, nickname: 'Milo', profileImageUrl: Cat13 },
  { userId: 14, nickname: 'Nina', profileImageUrl: Cat14 },
  { userId: 15, nickname: 'Orin', profileImageUrl: Cat15 },
  { userId: 16, nickname: 'Pia', profileImageUrl: Cat16 },
];
const user = (n: number) => users[n - 1];

// ────────────────────────────────────────────
// Posts (허용 노드/마크만 사용, 15개)
export const posts: Post[] = [
  {
    postId: 'p1',
    author: user(1),
    title: '스터디 운영 팁 모음',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: 'center' },
          content: [{ type: 'text', text: '운영의 핵심 3가지' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            { type: 'text', text: '일정 공유 / ' },
            { type: 'text', text: '역할 분담', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' / 회고 루틴' },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '주간 회의 30분' }] }],
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '이슈 트래커 기록' }] },
              ],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '간단 회고' }] }],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '템플릿은 ' },
            {
              type: 'text',
              text: '여기',
              marks: [{ type: 'link', attrs: { href: 'https://example.com/template' } }],
            },
            { type: 'text', text: '에서 받아가세요.' },
          ],
        },
      ],
    },
    categories: ['자기계발', '직장인', '5~10명'],
    likeCount: 7,
    commentCount: 2,
    isLikedByMe: true,
    isBookmarkedByMe: true,
    createdAt: '2025-09-01T09:12:00.000Z',
    updatedAt: '2025-09-01T09:12:00.000Z',
  },
  {
    postId: 'p2',
    author: user(2),
    title: 'React 상태관리 뭐 쓰세요?',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3, textAlign: null },
          content: [{ type: 'text', text: 'Zustand × TanStack Query' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '서버 상태는 ' },
            { type: 'text', text: 'Query', marks: [{ type: 'underline' }] },
            { type: 'text', text: ', UI 상태는 Zustand로 분리해보는 중' },
          ],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '경계 정의: fetch vs UI' }] },
              ],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '캐시 동기화' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '전역 토글/모달' }] }],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '참고 자료: ' },
            {
              type: 'text',
              text: '공식문서',
              marks: [{ type: 'link', attrs: { href: 'https://tanstack.com/query/latest' } }],
            },
          ],
        },
      ],
    },
    categories: ['프론트엔드', '대학생', '2~4명'],
    likeCount: 3,
    commentCount: 0,
    createdAt: '2025-09-02T14:35:00.000Z',
    updatedAt: '2025-09-02T14:35:00.000Z',
  },
  {
    postId: 'p3',
    author: user(3),
    title: '알고리즘 버디 구합니다',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: 'center' },
          content: [{ type: 'text', text: '주 3회, 90분 루틴' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            { type: 'text', text: '1시간 구현 + 30분 해설' },
            { type: 'hardBreak' },
            { type: 'text', text: '실패 케이스를 ' },
            { type: 'text', text: '강조', marks: [{ type: 'bold' }] },
            { type: 'text', text: '합니다.' },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'BFS/DFS 스위치 연습' }] },
              ],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '자료구조 선택' }] }],
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '시간복잡도 설명' }] },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '연락: ' },
            {
              type: 'text',
              text: '프로필 DM',
              marks: [{ type: 'link', attrs: { href: 'https://example.com/profile' } }],
            },
          ],
        },
      ],
    },
    categories: ['알고리즘', '취준생', '2~4명'],
    likeCount: 9,
    commentCount: 5,
    isBookmarkedByMe: true,
    createdAt: '2025-09-03T19:22:00.000Z',
    updatedAt: '2025-09-03T19:22:00.000Z',
  },
  {
    postId: 'p4',
    author: user(4),
    title: 'CS 스터디 커리큘럼 공유',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3, textAlign: null },
          content: [{ type: 'text', text: '커리큘럼 개요' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '네트워크(TCP/UDP/H2)' }] },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: '운영체제(프로세스/스레드)' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: '데이터베이스(인덱스/트랜잭션)' }],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '교재 추천: ' },
            { type: 'text', text: 'OS 공룡책', marks: [{ type: 'italic' }] },
            { type: 'text', text: ', Real MySQL' },
          ],
        },
      ],
    },
    categories: ['CS', '대학생', '5~10명'],
    likeCount: 6,
    commentCount: 3,
    isBookmarkedByMe: true,
    createdAt: '2025-09-04T08:05:00.000Z',
    updatedAt: '2025-09-04T08:05:00.000Z',
  },
  {
    postId: 'p5',
    author: user(5),
    title: '영어 회화 스터디 템플릿',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: 'center' },
          content: [{ type: 'text', text: '진행 포맷' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '주제 카드 뽑기' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '3분 스피치' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '피드백 루프' }] }],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '발음/강세/연결 발음 체크' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            { type: 'text', text: '샘플 질문 카드 보기: ' },
            {
              type: 'text',
              text: '링크',
              marks: [{ type: 'link', attrs: { href: 'https://example.com/cards' } }],
            },
          ],
        },
      ],
    },
    categories: ['영어 회화', '직장인', '5~10명'],
    likeCount: 2,
    commentCount: 0,
    createdAt: '2025-09-05T17:44:00.000Z',
    updatedAt: '2025-09-05T17:44:00.000Z',
  },
  {
    postId: 'p6',
    author: user(6),
    title: 'Next.js 15 Router 정리',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: null },
          content: [{ type: 'text', text: '핵심 포인트' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '파일 기반 라우팅' }] },
              ],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Server Actions' }] }],
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Streaming/Suspense' }] },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: 'RSC 경계에서 ' },
            { type: 'text', text: '캐싱 전략', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' 고려' },
          ],
        },
        {
          type: 'image',
          attrs: {
            src: 'https://picsum.photos/id/1015/640/320',
            alt: 'next-router',
            width: '640',
            height: '320',
          },
        },
      ],
    },
    categories: ['프론트엔드', '취준생', '2~4명'],
    likeCount: 11,
    commentCount: 5,
    isLikedByMe: true,
    isBookmarkedByMe: true,
    createdAt: '2025-09-06T10:10:00.000Z',
    updatedAt: '2025-09-06T10:10:00.000Z',
  },
  {
    postId: 'p7',
    author: user(7),
    title: '퇴근 루틴 공유합니다',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3, textAlign: null },
          content: [{ type: 'text', text: '소소하지만 확실한 루틴' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            { type: 'text', text: '30분 산책' },
            { type: 'hardBreak' },
            { type: 'text', text: '20분 정리' },
            { type: 'hardBreak' },
            { type: 'text', text: '10분 독서 📚' },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '꾸준함이 핵심입니다.', marks: [{ type: 'italic' }] }],
        },
      ],
    },
    categories: ['자기계발', '직장인', '2~4명'],
    likeCount: 1,
    commentCount: 1,
    createdAt: '2025-09-07T12:00:00.000Z',
    updatedAt: '2025-09-07T12:00:00.000Z',
  },
  {
    postId: 'p8',
    author: user(8),
    title: 'Supabase Edge Functions 삽질기',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: null },
          content: [{ type: 'text', text: 'CORS & JWT 포인트' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: 'JWT 검증은 ' },
            { type: 'text', text: '쉬움', marks: [{ type: 'underline' }] },
            { type: 'text', text: ', CORS 셋업은 주의' },
          ],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Origin 화이트리스트' }] },
              ],
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'OPTIONS 204 응답' }] },
              ],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '핸들러 구조화' }] }],
            },
          ],
        },
        {
          type: 'image',
          attrs: {
            src: 'https://picsum.photos/id/1005/600/300',
            alt: 'edge-functions',
            width: '600',
            height: '300',
          },
        },
      ],
    },
    categories: ['백엔드', '취준생', '2~4명'],
    likeCount: 5,
    commentCount: 2,
    createdAt: '2025-09-08T09:45:00.000Z',
    updatedAt: '2025-09-08T09:45:00.000Z',
  },
  {
    postId: 'p9',
    author: user(9),
    title: '토익 800 → 900 목표',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3, textAlign: null },
          content: [{ type: 'text', text: '학습 루틴' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '파트5 문법 루틴' }] },
              ],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '리스닝 쉐도잉' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '오답노트 3회전' }] }],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '반복이 곧 자신감!' }],
        },
      ],
    },
    categories: ['토익', '대학생', '5~10명'],
    likeCount: 0,
    commentCount: 0,
    createdAt: '2025-09-09T07:30:00.000Z',
    updatedAt: '2025-09-09T07:30:00.000Z',
  },
  {
    postId: 'p10',
    author: user(10),
    title: '데이터 사이언스 입문 로드맵',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: null },
          content: [{ type: 'text', text: '파이썬 → 판다스 → 시각화 → 통계' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'NumPy/Pandas 기초' }] },
              ],
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'EDA로 패턴 찾기' }] },
              ],
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'matplotlib로 시각화' }] },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '입문자는 ' },
            { type: 'text', text: '현실 데이터', marks: [{ type: 'bold' }] },
            { type: 'text', text: '를 반드시 다뤄볼 것' },
          ],
        },
      ],
    },
    categories: ['데이터 사이언스', '취준생', '5~10명'],
    likeCount: 8,
    commentCount: 4,
    isBookmarkedByMe: true,
    createdAt: '2025-09-10T15:55:00.000Z',
    updatedAt: '2025-09-10T15:55:00.000Z',
  },
  {
    postId: 'p11',
    author: user(11),
    title: 'UX/UI 스터디 자료 공유',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3, textAlign: null },
          content: [{ type: 'text', text: '읽을거리' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'HIG 요약' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '머티리얼 패턴' }] }],
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '마이크로 인터랙션 사례' }] },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [{ type: 'text', text: '피드백 환영', marks: [{ type: 'italic' }] }],
        },
      ],
    },
    categories: ['UX/UI', '직장인', '2~4명'],
    likeCount: 4,
    commentCount: 3,
    createdAt: '2025-09-11T21:05:00.000Z',
    updatedAt: '2025-09-11T21:05:00.000Z',
  },
  {
    postId: 'p12',
    author: user(12),
    title: 'JLPT N2 한 달 벼락치기',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: 'center' },
          content: [{ type: 'text', text: '전략' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '문법 암기장 2회전' }] },
              ],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '청해 집중' }] }],
            },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '독해 스키밍/스캐닝' }] },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '매일 ' },
            { type: 'text', text: '소리 내어 읽기', marks: [{ type: 'underline' }] },
            { type: 'text', text: ' 추천' },
          ],
        },
      ],
    },
    categories: ['JLPT', '대학생', '2~4명'],
    likeCount: 6,
    commentCount: 2,
    createdAt: '2025-09-12T11:25:00.000Z',
    updatedAt: '2025-09-12T11:25:00.000Z',
  },
  {
    postId: 'p13',
    author: user(13),
    title: '드로잉 입문 자료 모음',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3, textAlign: null },
          content: [{ type: 'text', text: '기본 루틴' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '기본 도형 연습' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '명암 단계' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '관찰 드로잉' }] }],
            },
          ],
        },
        {
          type: 'image',
          attrs: {
            src: 'https://picsum.photos/id/1025/560/300',
            alt: 'drawing-basics',
            width: '560',
            height: '300',
          },
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '참고: ' },
            {
              type: 'text',
              text: '연습 자료',
              marks: [{ type: 'link', attrs: { href: 'https://example.com/drawing' } }],
            },
          ],
        },
      ],
    },
    categories: ['드로잉', '중학생', '5~10명'],
    likeCount: 2,
    commentCount: 0,
    createdAt: '2025-09-13T16:40:00.000Z',
    updatedAt: '2025-09-13T16:40:00.000Z',
  },
  {
    postId: 'p14',
    author: user(14),
    title: '주식 단타 후기',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3, textAlign: null },
          content: [{ type: 'text', text: '초보라면...' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '단타는 ' },
            { type: 'text', text: '어렵다', marks: [{ type: 'bold' }] },
            { type: 'text', text: '. 장기투자 추천' },
          ],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '분할 매수/매도' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '현금 비중 유지' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '리스크 관리' }] }],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'right' },
          content: [{ type: 'text', text: '※ 개인적 소감입니다.', marks: [{ type: 'strike' }] }],
        },
      ],
    },
    categories: ['주식', '직장인', '2~4명'],
    likeCount: 3,
    commentCount: 1,
    createdAt: '2025-09-14T13:15:00.000Z',
    updatedAt: '2025-09-14T13:15:00.000Z',
  },
  {
    postId: 'p15',
    author: user(15),
    title: '서비스 기획 스터디 개설',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2, textAlign: 'center' },
          content: [{ type: 'text', text: 'PM 지망생 환영' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            { type: 'text', text: '가설 → 실험 → 학습 ' },
            { type: 'text', text: '사이클', marks: [{ type: 'underline' }] },
            { type: 'text', text: ' 연습' },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: '문제정의/페르소나' }] },
              ],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '가설 수립' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'MVP/측정' }] }],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: null },
          content: [
            { type: 'text', text: '참고 케이스: ' },
            {
              type: 'text',
              text: '링크',
              marks: [{ type: 'link', attrs: { href: 'https://example.com/pm-study' } }],
            },
          ],
        },
      ],
    },
    categories: ['서비스기획', '취준생', '5~10명'],
    likeCount: 10,
    commentCount: 4,
    createdAt: '2025-09-15T18:00:00.000Z',
    updatedAt: '2025-09-15T18:00:00.000Z',
  },
];

// ────────────────────────────────────────────
// Comments (그대로 사용 가능)
export const comments: CommentTree = [
  {
    commentId: 'c1',
    postId: 'p1',
    author: user(2),
    content: '꿀팁 감사합니다!',
    likeCount: 1,
    createdAt: '2025-09-01T10:00:00.000Z',
    updatedAt: '2025-09-01T10:00:00.000Z',
    parentCommentId: null,
    replyCount: 1,
    children: [
      {
        commentId: 'c2',
        postId: 'p1',
        author: user(1),
        content: '읽어주셔서 감사해요 🙏',
        likeCount: 0,
        createdAt: '2025-09-01T10:30:00.000Z',
        updatedAt: '2025-09-01T10:30:00.000Z',
        parentCommentId: 'c1',
      } as ReplyComment,
    ],
  } as RootComment,
  {
    commentId: 'c3',
    postId: 'p3',
    author: user(4),
    content: '저도 참여하고 싶어요!',
    likeCount: 2,
    createdAt: '2025-09-03T20:00:00.000Z',
    updatedAt: '2025-09-03T20:00:00.000Z',
    parentCommentId: null,
    replyCount: 0,
    children: [],
  } as RootComment,
  {
    commentId: 'c4',
    postId: 'p6',
    author: user(7),
    content: '정리 감사합니다. 코드 예시가 특히 좋네요.',
    likeCount: 3,
    createdAt: '2025-09-06T12:00:00.000Z',
    updatedAt: '2025-09-06T12:00:00.000Z',
    parentCommentId: null,
    replyCount: 0,
    children: [],
  } as RootComment,
  {
    commentId: 'c5',
    postId: 'p10',
    author: user(12),
    content: '데이터 분석 입문자에게 정말 유용합니다!',
    likeCount: 1,
    createdAt: '2025-09-10T16:00:00.000Z',
    updatedAt: '2025-09-10T16:00:00.000Z',
    parentCommentId: null,
    replyCount: 1,
    children: [
      {
        commentId: 'c6',
        postId: 'p10',
        author: user(10),
        content: '도움 되셨다니 다행이에요!',
        likeCount: 0,
        createdAt: '2025-09-10T16:30:00.000Z',
        updatedAt: '2025-09-10T16:30:00.000Z',
        parentCommentId: 'c5',
      } as ReplyComment,
    ],
  } as RootComment,
];

// export const mockPosts = {
//   async getPost(id: string): Promise<Post | undefined> {
//     // 네트워크 지연 흉내
//     await new Promise((r) => setTimeout(r, 200));
//     return posts.find((p) => p.postId === id);
//   },
//   async getComments(postId: string): Promise<CommentTree> {
//     // 네트워크 지연 흉내
//     await new Promise((r) => setTimeout(r, 200));
//     return comments.filter((c) => c.postId === postId);
//   },
//   async getAllPosts(): Promise<Post[]> {
//     // 네트워크 지연 흉내
//     await new Promise((r) => setTimeout(r, 200));
//     return posts;
//   },
// };
