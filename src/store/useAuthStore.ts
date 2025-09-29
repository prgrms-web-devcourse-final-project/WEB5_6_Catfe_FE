import { create } from "zustand";
import { setAccessToken } from "@/utils/api";
import { logoutApi } from "@/api/auth";

export interface User {
  userId: number;
  username: string;
  email: string;
  nickname: string;
  role: string;
  status: string;
  createdAt: string;
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,

  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    }
    set({ user });
  },

logout: async () => {
  // 1) accessToken 먼저 제거해서 interceptor가 동작하지 않게 함
  setAccessToken(null);

  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      await logoutApi(token); // 서버에 refresh token 무효화 
    }
  } catch (err) {
    console.error("[logout] 서버 로그아웃 실패:", err);
  } finally {
    // 로컬 초기화
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    set({ user: null });
  }
},


  init: async () => {
    try {
      if (typeof window !== "undefined") {
        // accessToken 복구
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
          setAccessToken(storedToken);
        }

        // user 복구
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser: User = JSON.parse(storedUser);
            set({ user: parsedUser });
          } catch {
            localStorage.removeItem("user");
          }
        }
      }
    } finally {
      set({ isHydrated: true });
    }
  },
}));
