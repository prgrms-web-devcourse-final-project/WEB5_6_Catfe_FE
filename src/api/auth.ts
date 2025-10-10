import { User } from '@/@types/type';
import api from '@/utils/api';
import { setAccessToken } from '@/utils/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname: string;
}

export interface RegisterResponse {
  userId: number;
  username: string;
  email: string;
  nickname: string;
  role: string;
  status: string;
  createdAt: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<{ data: LoginResponse }>('/api/auth/login', data);
  const { accessToken, user } = res.data.data;
  setAccessToken(accessToken);
  return { accessToken, user };
}

export async function logoutApi(accessToken: string | null): Promise<void> {
  if (!accessToken) return;

  await api.post(
    '/api/auth/logout',
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await api.post<{ data: RegisterResponse }>('/api/auth/register', data);
  return res.data.data;
}
