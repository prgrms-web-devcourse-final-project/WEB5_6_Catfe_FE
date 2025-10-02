"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api, { setAccessToken } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginOAuth2Page() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    async function handleSocialLogin() {
      try {
        // refresh → accessToken 받기
        const res = await api.post("/api/auth/refresh", null, {
          withCredentials: true,
        });

        const { accessToken } = res.data.data;
        setAccessToken(accessToken);

        //  /users/me 로 유저 정보 가져오기
        const meRes = await api.get("/api/users/me"); 
        const user = meRes.data.data;

        setUser(user);

        router.replace("/");
      } catch (err) {
        console.error("소셜 로그인 처리 실패:", err);
        router.replace("/login");
      }
    }

    handleSocialLogin();
  }, [router, setUser]);

  return <p>소셜 로그인 처리 중입니다...</p>;
}
