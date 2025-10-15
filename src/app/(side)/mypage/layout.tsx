import MyPageSidebar from '@/components/mypage/Sidebar';
import AuthChecker from './AuthChecker';

export default function MypageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthChecker>
      <div className="w-full h-full flex">
        <MyPageSidebar />
        <div className="p-8 min-h-dvh overflow-auto flex-1">{children}</div>
      </div>
    </AuthChecker>
  );
}
