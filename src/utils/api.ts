import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // 서버 주소
  withCredentials: true, // Refresh Token(HttpOnly 쿠키) 자동 관리
});

// 요청마다 Access Token 붙이기
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
