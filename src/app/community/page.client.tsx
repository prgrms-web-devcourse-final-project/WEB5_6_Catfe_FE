'use client';

import CommunityFilters from '@/components/community/CommunityFilters';
import CommunityTab from '@/components/community/CommunityTab';

function CommunityListClient() {
  return (
    <div className="max-w-[1200px] flex flex-col justify-start items-start gap-6 sm:gap-10 px-10 py-8 sm:px-[100px] sm:pb-[60px]">
      <CommunityTab />
      <header className="flex flex-col gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">스터디 그룹 탐색</h2>
        <p className="text-base sm:text-lg">함께 공부할 스터디 그룹을 찾아보세요!</p>
      </header>
      <CommunityFilters />
    </div>
  );
}
export default CommunityListClient;
