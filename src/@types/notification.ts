export type NotificationType =
  | 'room_join' // 내가 만든 스터디룸에 다른 사용자 입장
  | 'room_notice' // 내가 참여한 스터디룸에 공지 업로드
  | 'post_comment' // 내가 작성한 글에 댓글
  | 'like_received_post' // 내가 작성한 글에 좋아요
  | 'like_received_comment'; // 내가 작성한 댓글에 좋아요

export type NotificationItem = {
  id: number;
  type: NotificationType;
  actor: {
    nickname: string;
    avatarUrl?: string;
  };
  entity?: {
    roomId?: number;
    postId?: number;
    commentId?: number;
  };
  title: string; // 스터디룸 이름 또는 글 제목
  message?: string;
  createdAt: string;
  unread?: boolean;
  ctaLabel?: string;
};

export type NotificationPage = {
  items: NotificationItem[];
  nextCursor?: string | null;
};
