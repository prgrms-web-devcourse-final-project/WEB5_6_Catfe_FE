import { MyPostListPageResponse, MyPostListQuery } from '@/@types/community';
import { ApiResponse } from '@/@types/type';
import api from '@/utils/api';

const buildQueryString = (query: MyPostListQuery): string => {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.append('page', String(query.page));
  if (query.size !== undefined) params.append('size', String(query.size));
  if (query.sort) params.append('sort', query.sort);
  return params.toString();
};

/* 로그인 사용자가 북마크한 게시글 목록 조회 (GET /users/me/bookmarks) */
export async function apiGetMyBookmarks(query: MyPostListQuery): Promise<MyPostListPageResponse> {
  const queryString = buildQueryString(query);
  const url = `/users/me/bookmarks?${queryString}`;
  const { data: res } = await api.get<ApiResponse<MyPostListPageResponse>>(url);

  if (!res.success) throw new Error(res.message);
  return res.data;
}

/* 로그인 사용자가 작성한 게시글 목록 조회 (GET /users/me/posts) */
export async function apiGetMyPosts(query: MyPostListQuery): Promise<MyPostListPageResponse> {
  const queryString = buildQueryString(query);
  const url = `/users/me/posts?${queryString}`;
  const { data: res } = await api.get<ApiResponse<MyPostListPageResponse>>(url);

  if (!res.success) throw new Error(res.message);
  return res.data;
}
