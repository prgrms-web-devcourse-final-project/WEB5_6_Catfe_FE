// src/store/useAuthStore.ts
import { create } from "zustand";
import { setAccessToken } from "@/utils/api";

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
  logout: () => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,           

  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        console.log("[setUser] user 저장:", user);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        console.log("[setUser] user 삭제");
        localStorage.removeItem("user");
      }
    }
    set({ user });
  },

  logout: () => {
    console.log("[logout] 실행 → accessToken, user 삭제");
    setAccessToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    set({ user: null });
  },

  init: async () => {
    console.log("[init] 실행");
    try {
      if (typeof window !== "undefined") {
        // accessToken 복구
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
          console.log("[init] accessToken 복구 완료:", storedToken);
          setAccessToken(storedToken);
        } else {
          console.log("[init] accessToken 없음");
        }
        // user 복구
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser: User = JSON.parse(storedUser);
            console.log("[init] user 복구 완료:", parsedUser);
            set({ user: parsedUser });
          } catch (err) {
            console.error("[init] user 복구 실패 → JSON 파싱 에러:", err);
            localStorage.removeItem("user");
          }
        } else {
          console.log("[init] user 없음");
        }
      }
    } finally {
      set({ isHydrated: true });    
      console.log("[init] hydration 완료");
    }
  },
}));
