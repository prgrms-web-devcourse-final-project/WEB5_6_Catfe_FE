import CommunityTab from '@/components/community/CommunityTab';
import { Metadata } from 'next';
import EditorPageClient from './page.client';
import { Suspense } from 'react';
import Spinner from '@/components/Spinner';
export const metadata: Metadata = {
  title: 'Catfé | Editor',
  description: '스터디 그룹 모집 글을 작성해보세요.',
};

function Page() {
  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col justify-start items-start gap-6 sm:gap-10 px-10 py-8 sm:px-[100px] sm:pb-[60px]">
      <CommunityTab />
      <header className="flex flex-col gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">신규 그룹 만들기</h2>
        <p className="text-base sm:text-lg">함께 공부할 스터디 멤버를 모집해보세요!</p>
      </header>
      <Suspense
        fallback={
          <div className="w-full h-dvh">
            <Spinner />
          </div>
        }
      >
        <EditorPageClient />
      </Suspense>
    </div>
  );
}
export default Page;
