"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function InitAuth() {
  const { init, isHydrated } = useAuthStore();
  useEffect(() => {
    init();
  }, [init]);
  if (!isHydrated) {
    return null; 
  }
  return null;
}
