import api from "@/utils/api";
import { User } from "@/store/useAuthStore";
import { setAccessToken } from "@/utils/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<{ data: LoginResponse }>("/api/auth/login", data);
  const { accessToken, user } = res.data.data;
  setAccessToken(accessToken);
  return { accessToken, user };
}


export async function logoutApi(accessToken: string | null): Promise<void> {
  if (!accessToken) return;

  await api.post(
    "/api/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}