export type User = {
  user_id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  provider: string;
  provider_id: string;
  status: string; // 실제 STATUS ENUM으로 수정 필요
};

export type UserProfile = {
  user_id: string;
  nickname: string;
  profile_image_url?: string | null;
  bio: string;
  point: number;
};

export type PaginationItemType = 'first' | 'prev' | 'page' | 'ellipsis' | 'next' | 'last';

export type PaginationItem = {
  key: string;
  type: PaginationItemType;
  page?: number;
  selected?: boolean;
  disabled?: boolean;
};
