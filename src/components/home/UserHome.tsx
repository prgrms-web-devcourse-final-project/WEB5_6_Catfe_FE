'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { debounce } from '@/utils/debounce';
import Button from '@/components/Button';
import CreateRoomModal from '@/components/study-room/CreateRoomModal';
import cat13 from '@/assets/cats/cat-13.svg';
import UserHomeBanner from './UserHomeBanner';
import HostList from './HostList';
import JoinList from './JoinList';
import { User } from '@/@types/type';
import MarqueeRow from './MarqueeRow';

export default function UserHome({ user }: { user: User }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value.trim());
      }, 300),
    []
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearch(value);
  };

  return (
    <main className="min-h-screen w-full bg-background-base flex flex-col items-center justify-center">
      <section className="w-full bg-secondary-300">
        <div className="mx-auto max-w-[1200px] px-10 sm:px-[100px] flex flex-row items-center justify-between">
          <div className="flex flex-col gap-4">
            <span className="text-2xl md:text-xl font-bold text-text-primary shrink-0">
              고양이와 함께하는 온라인 스터디 공간
            </span>
            <Image src="/image/logo-light.svg" alt="캣페 로고" width={348} height={84} />
          </div>
          <UserHomeBanner />
        </div>
      </section>

      <div className="max-w-[1200px] w-full pt-12 px-10 pb-8 sm:px-[100px] sm:pb-[60px]">
        <div className="flex justify-between mb-10">
          <div className="flex items-center gap-2">
            <Image src={cat13} alt="cat" width={40} height={40} />
            <span className="text-sm text-text-primary">
              <strong>{user.profile.nickname}</strong> 님! 오늘은 어디로?
            </span>
          </div>

          <div className="relative block w-full sm:w-80">
            <input
              type="text"
              value={inputValue}
              onChange={onChange}
              placeholder="참여 중인 캣페 찾기"
              className="w-full rounded-md border border-black/10 px-3 py-2 pr-9 text-sm outline-none focus:border-black/30"
              aria-label="캣페 검색어 입력"
            />
            <button
              type="button"
              aria-label="검색 버튼"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 cursor-pointer"
            >
              <Image src="/icon/study-room/search.svg" alt="검색 아이콘" width={16} height={16} />
            </button>
          </div>

          <Button
            size="md"
            borderType="solid"
            color="primary"
            onClick={() => setCreateOpen(true)}
            aria-label="새로운 스터디룸 만들기"
          >
            + 새로운 캣페 만들기
          </Button>
        </div>

        <hr className="mb-10" />

        <HostList search={search} />

        <div className="py-20">
          <MarqueeRow direction="ltr"></MarqueeRow>
        </div>
        
        <JoinList search={search} />
      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </main>
  );
}
