'use client';

import { MyPostListQuery } from '@/@types/community';
import PostCard from '@/components/community/PostCard';
import Pagination from '@/components/Pagination';
import { useMyPosts } from '@/hook/useMyPostList';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function MyPostList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query: MyPostListQuery & { page: number; size: number } = {
    page: Number(searchParams.get('page')) || 0,
    size: Number(searchParams.get('size')) || 20,
    sort: searchParams.get('sort') || 'createdAt,desc',
  };
  const { pageItems, totalPages, isFetching } = useMyPosts(query);
  const pageSize = query.size;

  // 페이지 변경 핸들러: URL 업데이트 (tab, page, size, sort)
  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(newPage)); // page만 변경
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col justify-start items-start gap-6 sm:gap-10 px-10 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
        {/* loading skeleton */}
        {isFetching
          ? Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-gray-400 animate-pulse" />
            ))
          : pageItems.map((post) => <PostCard key={post.postId} post={post} />)}
        {/* data가 없을 경우 */}
        {!isFetching && pageItems.length === 0 && (
          <div className="col-span-full text-center py-10 text-text-secondary">
            아직 작성하신 게시글이 없어요.
          </div>
        )}
      </div>
      <div className="mx-auto mt-6">
        <Pagination
          defaultPage={query.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default MyPostList;
