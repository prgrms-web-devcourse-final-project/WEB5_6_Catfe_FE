'use client';

import CommunityFilters from '@/components/community/CommunityFilters';
import CommunityTab from '@/components/community/CommunityTab';
import PostCard from '@/components/community/PostCard';
import { useAllPostsQuery } from '@/hook/useCommunityPost';
import { useCommunityUrl } from '@/hook/useCommunityUrl';
import { useFilteredPosts } from '@/hook/useFilteredPosts';

function CommunityListClient() {
  const { query, push } = useCommunityUrl();
  const { data, isLoading } = useAllPostsQuery();
  const { pageItems, total, totalPages } = useFilteredPosts(data);

  return (
    <div className="max-w-[1200px] flex flex-col justify-start items-start gap-6 sm:gap-10 px-10 py-8 sm:px-[100px] sm:pb-[60px]">
      <CommunityTab />
      <header className="flex flex-col gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">스터디 그룹 탐색</h2>
        <p className="text-base sm:text-lg">함께 공부할 스터디 그룹을 찾아보세요!</p>
      </header>
      <CommunityFilters value={query} onChange={(next) => push({ ...next, page: 1 })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {data &&
          data?.length > 0 &&
          data.map((post) => <PostCard key={post.post_id} post={post} />)}
      </div>
    </div>
  );
}
export default CommunityListClient;
