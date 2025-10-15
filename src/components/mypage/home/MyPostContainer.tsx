'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import MyPostList from './MyPostList';
import MyBookmarkList from './MyBookmarkList';

type TabType = 'my' | 'bookmark';

function MyPostContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab: TabType = (searchParams.get('tab') as TabType) || 'my';
  const handleTabChange = (newTab: TabType) => {
    if (newTab === currentTab) return;

    const newParams = new URLSearchParams();
    newParams.set('tab', newTab);
    newParams.set('page', '0');
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col w-full h-full bg-background-white rounded-2xl border-2 border-secondary-600 shadow-md overflow-hidden">
      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-300 px-10 pt-4">
        {/* 내가 작성한 글 탭 */}
        <button
          onClick={() => handleTabChange('my')}
          className={`py-2 px-6 text-lg font-semibold transition-colors duration-200 
            ${
              currentTab === 'my'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          내가 작성한 글
        </button>

        {/* 북마크한 글 탭 */}
        <button
          onClick={() => handleTabChange('bookmark')}
          className={`py-2 px-6 text-lg font-semibold transition-colors duration-200 
            ${
              currentTab === 'bookmark'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          북마크한 글
        </button>
      </div>

      {/* 목록 컨텐츠 */}
      <div className="flex-1 overflow-auto">
        {currentTab === 'my' && <MyPostList />}
        {currentTab === 'bookmark' && <MyBookmarkList />}
      </div>
    </div>
  );
}
export default MyPostContainer;
