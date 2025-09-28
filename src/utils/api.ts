// src/utils/api.ts
import axios, { AxiosRequestConfig } from "axios";

let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 토큰 저장 및 localStorage 반영
export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
      console.log("[AccessToken 저장됨]", token);
    } else {
      localStorage.removeItem("accessToken");
      console.log("[AccessToken 삭제됨]");
    }
  }
};

// 앱 시작 시 localStorage  메모리 복구
if (typeof window !== "undefined") {
  accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    console.log("[앱 시작] localStorage에서 AccessToken 복구:", accessToken);
  }
}

// refreshToken 쿠키 자동 전송
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  withCredentials: true, 
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    console.log("[요청] AccessToken 포함:", config.url);
  } else {
    console.log("[요청] AccessToken 없음:", config.url);
  }
  return config;
});

// refresh 완료 후 큐에 있던 요청 실행
function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
  console.log("[refresh 완료] 대기중이던 요청 처리됨");
}

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as AxiosRequestConfig & { _retry?: boolean };
    // 401 accessToken 만료로 판단
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn("[401 감지] AccessToken 만료 → refresh 시도");
      // 이미 다른 요청이 refresh 중이면 큐에 대기
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

      // refresh 요청 시작
      isRefreshing = true;
      try {
        const refreshRes = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          null,
          { withCredentials: true }
        );

        const newToken = refreshRes.data.data.accessToken;
        console.log("[refresh 성공] 새로운 AccessToken:", newToken);

        setAccessToken(newToken);

        // 큐에 있던 요청 실행
        onRefreshed(newToken);

        // 원래 요청 재실행
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };

        return api.request(originalRequest);
      } catch (refreshErr) {
        console.error("[refresh 실패] → 강제 로그아웃");
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
