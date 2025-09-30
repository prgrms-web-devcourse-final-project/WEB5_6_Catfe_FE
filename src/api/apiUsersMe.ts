/* /api/users/me GET & PATCH 함수 */

import { ApiResponse, UpdateUserBody, User } from '@/@types/type';
import api from '../utils/api';

export async function apiGetMe(): Promise<User> {
  const { data: res } = await api.get<ApiResponse<User>>('/users/me');
  if (!res.success) throw new Error(`GET /api/users/me/ failed: ${res.message}`);
  return res.data;
}

export async function apiPatchMe(payload: UpdateUserBody): Promise<User> {
  const { data: res } = await api.patch<ApiResponse<User>>('/users/me', payload);
  if (!res.success) throw new Error(`PATCH /api/users/me/ failed: ${res.message}`);
  return res.data;
}
