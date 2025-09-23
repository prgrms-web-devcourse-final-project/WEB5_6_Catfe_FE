'use client';

import CommunityTab from '@/components/community/CommunityTab';

function CommunityListClient() {
  return (
    <div className="max-w-[1200px] flex flex-col justify-start items-start gap-6 sm:gap-10 px-10 py-8 sm:px-[100px] sm:pb-[60px]">
      <CommunityTab />
    </div>
  );
}
export default CommunityListClient;
