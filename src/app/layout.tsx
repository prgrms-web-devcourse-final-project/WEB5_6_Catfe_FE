import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';
import localFont from 'next/font/local';
import '@/styles/style.css';

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
});

const nanumSquareNeo = localFont({
  src: './fonts/NanumSquareNeo-Variable.ttf',
  variable: '--font-nanum',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Catfé',
  description: '고양이들이 가득한 온라인 스터디 카페에서 친구들과 함께 공부하세요',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko-KR">
      <body className={`${orbitron.variable} ${nanumSquareNeo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
