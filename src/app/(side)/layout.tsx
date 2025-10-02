/* 사이드바가 필요한 페이지를 위한 좌우 margin/padding이 없는 레이아웃 */

export default function SideLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-dvh w-dvw">{children}</div>;
}
