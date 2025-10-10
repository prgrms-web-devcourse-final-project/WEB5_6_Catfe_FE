import { Metadata } from 'next';
import CommunityListClient from './page.client';
import { Suspense } from 'react';
import Spinner from '@/components/Spinner';

export const metadata: Metadata = {
  title: 'Catfé | Community',
  description: '같이 공부할 고양이 친구들을 찾아보세요.',
};

function Page() {
  return (
    <div className="w-full max-w-[1200px] mx-auto ">
      <h2 className="sr-only">Community Page</h2>
      <Suspense
        fallback={
          <div className="w-full h-dvh">
            <Spinner />
          </div>
        }
      >
        <CommunityListClient />
      </Suspense>
    </div>
  );
}
export default Page;
