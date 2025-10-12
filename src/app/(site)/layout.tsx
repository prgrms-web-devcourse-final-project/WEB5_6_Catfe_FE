/* 기본 Header + Footer를 포함하는 사이트 레이아웃 */

import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
