// src/utils/api.ts
import axios, { AxiosRequestConfig } from 'axios';

let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 토큰 저장 및 localStorage 반영
export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }
};

// 앱 시작 시 localStorage → 메모리 복구
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
  }
}

// refreshToken 쿠키 자동 전송
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }
  return config;
});

// refresh 완료 후 큐에 있던 요청 실행
function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as AxiosRequestConfig & { _retry?: boolean };

    // 401 → AccessToken 만료
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('[401 감지] AccessToken 만료 → refresh 시도');

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            resolve(api.request(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/refresh`,
          null,
          { withCredentials: true }
        );

        const newToken = refreshRes.data.data.accessToken;

        setAccessToken(newToken);

        onRefreshed(newToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };

        return api.request(originalRequest);
      } catch (refreshErr) {
        console.error('[refresh 실패] → 강제 로그아웃');
        setAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
