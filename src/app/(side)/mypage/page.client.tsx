'use client';

import { useUser } from '@/api/apiUsersMe';
import MyHomeProfile from '@/components/mypage/home/MyHomeProfile';

function MyPageClient() {
  const { data: user, isLoading } = useUser();

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-text-primary font-extrabold text-3xl">
        {user?.profile.nickname ?? 'GUEST'} 님, 오늘의 공부를 시작해볼까요?
      </h2>
      <div className="flex gap-10">
        <MyHomeProfile />
      </div>
    </div>
  );
}
export default MyPageClient;
