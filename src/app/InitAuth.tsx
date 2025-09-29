"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function InitAuth() {
  const { init, isHydrated } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (!isHydrated) {
    console.log("[InitAuth] 아직 hydration 중...");
    return null; 
  }

  console.log("[InitAuth] hydration 완료, 렌더링 시작");
  return null;
}
