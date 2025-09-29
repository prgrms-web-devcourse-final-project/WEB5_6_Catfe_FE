import MyPageSidebar from '@/components/mypage/Sidebar';

export default function MypageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full flex">
      <MyPageSidebar />
      <div className="p-8 min-h-dvh overflow-auto">{children}</div>
    </div>
  );
}
