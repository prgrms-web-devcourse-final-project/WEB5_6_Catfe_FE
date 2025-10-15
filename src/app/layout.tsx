import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';
import localFont from 'next/font/local';
import '@/styles/style.css';
import 'react-toastify/dist/ReactToastify.css';
import QueryProvider from '@/provider/QueryProvider';
import InitAuth from './InitAuth';
import { ConfirmHost } from '@/components/ConfirmModal';
import { ToastProvider } from './ToastProvider';

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
});

const nanumSquareNeo = localFont({
  src: '../assets/fonts/NanumSquareNeo-Variable.ttf',
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
        <QueryProvider>
          <InitAuth />
          <div>{children}</div>
        </QueryProvider>
        <ConfirmHost />
        <ToastProvider />
      </body>
    </html>
  );
}
