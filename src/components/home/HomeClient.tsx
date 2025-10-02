"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import GuestHome from "./GuestHome";
import UserHome from "./UserHome";

export default function HomeClient() {
  const { user, isHydrated, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (!isHydrated) {
    return <div>로딩중...</div>; // 추후 로딩페이지..?
  }

  if (!user) {
    return <GuestHome />;
  }

  return <UserHome user={user} />;
}