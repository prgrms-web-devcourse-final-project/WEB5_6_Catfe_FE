/* /api/users/me/password PATCH 함수 */

import { ApiResponse } from '@/@types/type';
import api from '@/utils/api';

export type ChangePasswordReqBody = {
  currentPassword: string;
  newPassword: string;
};

export async function apiChangePassword(
  payload: ChangePasswordReqBody
): Promise<ApiResponse<null>> {
  const { data: res } = await api.patch<ApiResponse<null>>('/users/me/password', payload);
  if (!res.success) throw new Error(`PATCH /api/users/me/ failed: ${res.message}`);
  return res;
}
