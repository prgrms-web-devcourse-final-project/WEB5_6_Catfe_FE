/* /api/users/me 관련 fetch 함수 */

import { ApiResponse, UpdateUserBody, User } from '@/@types/type';
import api from '../api';
/* fetch
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiGetMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/me`, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET /api/users/me/ failed: ${res.status}`);
  const json: ApiResponse<User> = await res.json();
  if (!json.success) throw new Error(json.message || 'fetch: GetMe failed');
  return json.data;
}

export async function apiPatchMe(body: UpdateUserBody): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH /api/users/me/ failed: ${res.status}`);
  const json: ApiResponse<User> = await res.json();
  if (!json.success) throw new Error(json.message || 'fetch: PatchMe failed');
  return json.data;
}
*/

// AXIOS로 수정 (근데 왜 data.data??...)
export async function apiGetMe(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/users/me');
  if (!data.success) throw new Error(`GET /api/users/me/ failed: ${data.message}`);
  return data.data;
}

export async function apiPatchMe(body: UpdateUserBody): Promise<User> {
  const { data } = await api.patch<ApiResponse<User>>('/users/me', body);
  if (!data.success) throw new Error(`PATCH /api/users/me/ failed: ${data.message}`);
  return data.data;
}
