import { Metadata } from 'next';
import CommunityListClient from './page.client';

export const metadata: Metadata = {
  title: 'Catfé | Community',
  description: '같이 공부할 고양이 친구들을 찾아보세요.',
};

function Page() {
  return (
    <div className="w-full max-w-[1200px] mx-auto ">
      <h2 className="sr-only">Community Page</h2>
      <CommunityListClient />
    </div>
  );
}
export default Page;
