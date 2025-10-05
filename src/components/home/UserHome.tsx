"use client";

import { useState } from "react";
import Image from "next/image";
import RoomList from "@/components/study-room/RoomList";
import { DUMMY_ROOMS } from "@/mock/rooms";
import type { User } from "@/store/useAuthStore";
import type { RoomSnapshot } from "@/@types/room";
import Button from "@/components/Button";
import CreateRoomModal from "@/components/study-room/CreateRoomModal";
import cat12 from "@/assets/cats/cat-12.svg";
import cat13 from "@/assets/cats/cat-13.svg";
import UserHomeBanner from "./UserHomeBanner";
import MyList from "./UserHomeMyList";

export default function UserHome({ user }: { user: User }) {
  const rooms: RoomSnapshot[] = Object.values(DUMMY_ROOMS);
  const recent = rooms.slice(0, 3);
  const [createOpen, setCreateOpen] = useState(false);

  const onCreateRoom = () => setCreateOpen(true);

  const [search, setSearch] = useState("");

  const onSearch = (keyword: string) => {
    console.log("검색 키워드:", keyword);
    // TODO: API 연동 후 검색 기능 개발
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(search.trim());
  };

  return (
    <main className="min-h-screen w-full bg-background-base flex flex-col items-center justify-center">
      <section className="w-full bg-secondary-300">
        <div className="mx-auto max-w-[1200px] px-10 sm:px-[100px]
                        flex flex-row items-center justify-between">
          <div className="flex flex-col gap-4">
            <span className="text-2xl md:text-xl font-bold text-text-primary shrink-0">
              고양이와 함께하는 온라인 스터디 공간
            </span>
            <Image src="/image/logo-light.svg" alt="캣페 로고" width={348} height={84}></Image>
          </div>

          {/* 배너는 자체 stage가 shrink-0이라 폭 유지됨 */}
          <UserHomeBanner />
        </div>
      </section>

      <div className="max-w-[1200px] w-full pt-8 px-10 py-8 sm:px-[100px] sm:pb-[60px]">
        <div className="flex justify-between mb-10">
          <div className="flex items-center gap-2">
            <Image src={cat13} alt="cat" width={40} height={40} />
            <span className="text-sm text-text-primary">
              <strong>{user.nickname}</strong> 님! 오늘은 어디로?
            </span>
          </div>

          <form onSubmit={onSubmit} className="relative block w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="방문했던 캣페 찾기"
              className="w-full rounded-md border border-black/10 px-3 py-2 pr-9 text-sm outline-none focus:border-black/30"
              aria-label="캣페 검색어 입력"
            />
            <button
              type="submit"
              aria-label="검색 버튼"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 cursor-pointer"
            >
              <Image
                src="/icon/study-room/search.svg"
                alt="검색 아이콘"
                width={16}
                height={16}
              />
            </button>
          </form>

          <Button
              size="sm"
              borderType="solid"
              color="primary"
              onClick={onCreateRoom}
              aria-label="새로운 스터디룸 만들기"
            >
              + 새로운 캣페 만들기
          </Button>
        </div>

        <hr className="mb-10"/>

        <section className="flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-text-primary">최근 방문</h2>
            <RoomList rooms={recent} />
        </section>

        <div className="flex justify-between py-20">
          <Image src={cat13} alt="cat13" width={40} height={40} />
          <Image src={cat12} alt="cat12" width={40} height={40} />
          <Image src={cat13} alt="cat13" width={40} height={40} />
          <Image src={cat12} alt="cat12" width={40} height={40} />
          <Image src={cat13} alt="cat13" width={40} height={40} />
          <Image src={cat12} alt="cat12" width={40} height={40} />
          <Image src={cat13} alt="cat13" width={40} height={40} />
          <Image src={cat12} alt="cat12" width={40} height={40} />
          <Image src={cat13} alt="cat13" width={40} height={40} />
          <Image src={cat12} alt="cat12" width={40} height={40} />
          <Image src={cat13} alt="cat13" width={40} height={40} />
        </div>

        <MyList></MyList>
      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </main>
  );
}
