import { NotificationItem } from '@/@types/notification';
import type { UserSummary } from '@/@types/community';

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
  { id: 1, nickname: 'Alice', profileImageUrl: Cat1 },
  { id: 2, nickname: 'Bob', profileImageUrl: Cat2 },
  { id: 3, nickname: 'Charlie', profileImageUrl: Cat3 },
  { id: 4, nickname: 'Dana', profileImageUrl: Cat4 },
  { id: 5, nickname: 'Eden', profileImageUrl: Cat5 },
  { id: 6, nickname: 'Finn', profileImageUrl: Cat6 },
  { id: 7, nickname: 'Grace', profileImageUrl: Cat7 },
  { id: 8, nickname: 'Hugh', profileImageUrl: Cat8 },
  { id: 9, nickname: 'Iris', profileImageUrl: Cat9 },
  { id: 10, nickname: 'Juno', profileImageUrl: Cat10 },
  { id: 11, nickname: 'Kane', profileImageUrl: Cat11 },
  { id: 12, nickname: 'Lia', profileImageUrl: Cat12 },
  { id: 13, nickname: 'Milo', profileImageUrl: Cat13 },
  { id: 14, nickname: 'Nina', profileImageUrl: Cat14 },
  { id: 15, nickname: 'Orin', profileImageUrl: Cat15 },
  { id: 16, nickname: 'Pia', profileImageUrl: Cat16 },
];

export const MOCK_ASIDE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 2001,
    type: 'room_join',
    actor: { nickname: users[3].nickname, avatarUrl: users[3].profileImageUrl as string }, // Dana
    entity: { roomId: 42 },
    title: '모각코: 리액트 상태관리',
    message:
      'Dana 님이 스터디룸에 입장했습니다. 오늘 세션에서는 전역 상태의 책임 범위와 컴포넌트 트리 분할 전략을 함께 실습합니다.',
    createdAt: '2025-09-28T06:15:00.000Z',
    unread: true,
    ctaLabel: '바로가기',
  },
  {
    id: 2002,
    type: 'room_notice',
    actor: { nickname: users[6].nickname, avatarUrl: users[6].profileImageUrl as string }, // Grace
    entity: { roomId: 42 },
    title: '모각코: 리액트 상태관리',
    message:
      '공지: 오늘 21:00 ~ 23:00 정규 스터디 진행합니다. 과제는 “상태 범위 줄이기” 글을 읽고 불필요한 렌더를 줄이는 방향으로 리팩토링 예시를 하나 이상 만들어 오세요.',
    createdAt: '2025-09-28T05:00:00.000Z',
    unread: true,
    ctaLabel: '바로가기',
  },
  {
    id: 2003,
    type: 'post_comment',
    actor: { nickname: users[12].nickname, avatarUrl: users[12].profileImageUrl as string }, // Milo
    entity: { postId: 88 },
    title: 'Next.js 이미지 최적화 팁',
    message:
      '“use client를 제거하고 서버 컴포넌트 경계로 나누니 로딩 체감이 확 좋아졌어요. 특히 이미지 도메인 화이트리스트를 잘 관리하니까 빌드 에러도 줄었습니다. 자세한 설정 스크린샷도 공유해 주실 수 있나요?”',
    createdAt: '2025-09-28T03:40:00.000Z',
    unread: true,
    ctaLabel: '바로가기',
  },
  {
    id: 2004,
    type: 'like_received_post',
    actor: { nickname: users[0].nickname, avatarUrl: users[0].profileImageUrl as string }, // Alice
    entity: { postId: 88 },
    title: 'Next.js 이미지 최적화 팁',
    message:
      'Alice 님이 회원님의 글을 좋아합니다. “도메인 설정과 캐시 전략 설명이 특히 유익했어요.”',
    createdAt: '2025-09-28T02:55:00.000Z',
    unread: false,
  },
  {
    id: 2005,
    type: 'like_received_comment',
    actor: { nickname: users[1].nickname, avatarUrl: users[1].profileImageUrl as string }, // Bob
    entity: { postId: 92, commentId: 12 },
    title: '댓글: 상태 관리는 신중하게',
    message:
      'Bob 님이 회원님의 댓글을 좋아합니다. “하위 트리로 상태를 내리는 것보다 컨텍스트로 올리는 게 나을 때가 분명 있죠.”',
    createdAt: '2025-09-28T01:10:00.000Z',
    unread: false,
  },
  {
    id: 2006,
    type: 'room_join',
    actor: { nickname: users[4].nickname, avatarUrl: users[4].profileImageUrl as string }, // Eden
    entity: { roomId: 7 },
    title: '모각코: TypeScript 치트시트',
    message:
      'Eden 님이 스터디룸에 입장했습니다. 오늘은 제네릭 기본기와 유틸리티 타입 구현(Partial, Pick 등)을 스스로 만들어보는 시간을 갖습니다.',
    createdAt: '2025-09-27T23:20:00.000Z',
    unread: true,
  },
  {
    id: 2007,
    type: 'room_notice',
    actor: { nickname: users[10].nickname, avatarUrl: users[10].profileImageUrl as string }, // Kane
    entity: { roomId: 7 },
    title: '모각코: TypeScript 치트시트',
    message:
      '공지: 과제 업로드 안내 — “Discriminated Union으로 상태머신 모델링하기” 노션 페이지를 확인하고, 본인 프로젝트에 적용한 사례를 댓글로 남겨주세요.',
    createdAt: '2025-09-27T21:00:00.000Z',
    unread: false,
    ctaLabel: '바로가기',
  },
  {
    id: 2008,
    type: 'post_comment',
    actor: { nickname: users[14].nickname, avatarUrl: users[14].profileImageUrl as string }, // Orin
    entity: { postId: 71 },
    title: 'React 19 Actions 정리',
    message:
      '“액션 패턴으로 폼을 옮기니 로딩/에러 핸들링이 한결 깔끔해졌어요. CSRF 토큰 처리와 낙관적 업데이트 예시도 추가해주시면 완벽할 것 같습니다.”',
    createdAt: '2025-09-27T18:30:00.000Z',
    unread: false,
  },
  {
    id: 2009,
    type: 'like_received_post',
    actor: { nickname: users[8].nickname, avatarUrl: users[8].profileImageUrl as string }, // Iris
    entity: { postId: 71 },
    title: 'React 19 Actions 정리',
    message:
      'Iris 님이 회원님의 글을 좋아합니다. “서버 액션으로 파일 업로드 처리한 부분이 특히 도움 됐어요.”',
    createdAt: '2025-09-27T16:05:00.000Z',
    unread: true,
  },
  {
    id: 2010,
    type: 'post_comment',
    actor: { nickname: users[2].nickname, avatarUrl: users[2].profileImageUrl as string }, // Charlie
    entity: { postId: 95 },
    title: 'Edge Functions로 웹훅 처리하기',
    message:
      '“서명 검증 로직을 람다에서 미들웨어로 분리한 게 인상적이었습니다. 재시도 정책과 DLQ 구성도 글에 추가해주시면 좋겠어요.”',
    createdAt: '2025-09-27T13:12:00.000Z',
    unread: false,
  },
  {
    id: 2011,
    type: 'like_received_comment',
    actor: { nickname: users[7].nickname, avatarUrl: users[7].profileImageUrl as string }, // Hugh
    entity: { postId: 95, commentId: 44 },
    title: '댓글: 함수형 업데이트가 필요한 순간',
    message:
      'Hugh 님이 회원님의 댓글을 좋아합니다. “동시성 모드에서 함수형 업데이트 예시가 큰 도움이 됐습니다.”',
    createdAt: '2025-09-27T10:00:00.000Z',
    unread: true,
  },
  {
    id: 2012,
    type: 'room_join',
    actor: { nickname: users[15].nickname, avatarUrl: users[15].profileImageUrl as string }, // Pia
    entity: { roomId: 108 },
    title: '모각코: 픽셀아트 배경 꾸미기 ✨☕️🎨',
    message:
      'Pia 님이 스터디룸에 입장했습니다. 오늘은 카페 타일셋에 포스터와 조명 오브젝트를 추가하는 작업을 함께 진행합니다.',
    createdAt: '2025-09-27T08:45:00.000Z',
    unread: false,
    ctaLabel: '바로가기',
  },
];
