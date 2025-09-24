'use client';

import tw from '@/utils/tw';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function CommunityTab() {
  const pathname = usePathname();
  const isList = pathname === '/community';

  return (
    <div className="max-w-[800px] w-full lg:w-1/2 bg-gray-600 rounded-full flex  justify-between px-2 py-2 mx-auto">
      <div
        className={tw(
          'rounded-full w-1/2 py-1',
          isList ? 'bg-secondary-50 text-text-primary' : 'text-secondary-50'
        )}
      >
        <Link href="/community" className="inline-flex gap-4 w-full items-center justify-center">
          <Image
            src={isList ? '/icon/community/search-black.svg' : '/icon/community/search-white.svg'}
            alt=""
            width={16}
            height={16}
            className="w-4 h-auto"
            unoptimized
            priority={false}
          />
          <span className="block text-xs sm:text-base">스터디 그룹 탐색</span>
        </Link>
      </div>
      <div
        className={tw(
          'rounded-full w-1/2 py-1',
          isList ? 'text-secondary-50' : 'bg-secondary-50 text-text-primary'
        )}
      >
        <Link
          href="/community/editor"
          className="inline-flex gap-4 w-full items-center justify-center"
        >
          <Image
            src={isList ? '/icon/community/plus-white.svg' : '/icon/community/plus-black.svg'}
            alt=""
            width={16}
            height={16}
            className="w-4 h-auto"
            unoptimized
            priority={false}
          />
          <span className="block text-xs sm:text-base">신규 그룹 모집</span>
        </Link>
      </div>
    </div>
  );
}
export default CommunityTab;
