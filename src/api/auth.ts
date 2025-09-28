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
  const res = await api.post<{ data: LoginResponse }>("/auth/login", data);
  const { accessToken, user } = res.data.data;
  setAccessToken(accessToken);
  return { accessToken, user };
}
