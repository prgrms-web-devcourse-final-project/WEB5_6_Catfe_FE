export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type User = {
  userId: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: string; // 실제 STATUS ENUM으로 수정 필요
  provider: string;
  providerId: string | null;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
};

// 최초 회원가입 시 받는 정보(nickname)가 아니면 undefined? null??
export type UserProfile = {
  nickname: string;
  profileImageUrl: string | null;
  bio?: string;
  birthDate?: string | null;
  point?: number;
};

// /api/users/me PATCH 용 Requset Body
export type UpdateUserBody = {
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  birthDate: string | null;
};

export type PaginationItemType = 'first' | 'prev' | 'page' | 'ellipsis' | 'next' | 'last';

export type PaginationItem = {
  key: string;
  type: PaginationItemType;
  page?: number;
  selected?: boolean;
  disabled?: boolean;
};

export type ApiListPaginationResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type ApiPaginationResponse<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type ConfirmTone = 'default' | 'success' | 'danger';

export type ConfirmOptions = {
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmTone;
  icon?: React.ReactNode;
  busy?: boolean;
};
