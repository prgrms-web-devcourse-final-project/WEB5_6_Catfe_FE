import type { User } from "@/store/useAuthStore";

export default function UserHome({ user }: { user: User }) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <h1>안녕하세요, {user.nickname}님 🎉</h1>
        <p>오늘도 열공해볼까요?</p>
      </div>
    </main>
  );
}