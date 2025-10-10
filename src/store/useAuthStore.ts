import { create } from 'zustand';
import { setAccessToken } from '@/utils/api';
import { logoutApi } from '@/api/auth';

export interface AuthState {
  isHydrated: boolean;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isHydrated: false,
  logout: async () => {
    // 1) accessToken 먼저 제거해서 interceptor가 동작하지 않게 함
    setAccessToken(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await logoutApi(token); // 서버에 refresh token 무효화
      }
    } catch (err) {
      console.error('[logout] 서버 로그아웃 실패:', err);
    } finally {
      // 로컬 초기화
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  },

  init: async () => {
    try {
      if (typeof window !== 'undefined') {
        // accessToken 복구
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          setAccessToken(storedToken);
        }
      }
    } finally {
      set({ isHydrated: true });
    }
  },
}));
