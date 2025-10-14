'use client';

import { useUser } from '@/api/apiUsersMe';
import MyHomeProfile from '@/components/mypage/home/MyHomeProfile';
import MyHomeTodo from '@/components/mypage/home/MyHomeTodo';

function MyPageClient() {
  const { data: user, isLoading } = useUser();

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-10 p-10">
      <h2 className="text-text-primary font-extrabold text-3xl">
        {user?.profile.nickname ?? 'GUEST'} 님, 오늘의 공부를 시작해볼까요?
      </h2>
      <div className="flex flex-col md:flex-row gap-10">
        <MyHomeProfile />
        <div className="flex-1 flex flex-col">
          <MyHomeTodo />
        </div>
      </div>
    </div>
  );
}
export default MyPageClient;
