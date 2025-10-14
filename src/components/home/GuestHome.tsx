'use client';

import { useRouter } from 'next/navigation';
import StudyRoomCard from '@/components/study-room/StudyRoomCard';
import Button from '../Button';
import type { RoomSnapshotUI } from '@/@types/rooms';
import { DUMMY_ROOMS } from '@/mock/rooms';
import HoverInfoBox from './HoverInfoBox';
import MarqueeRow from './MarqueeRow';
import HeroFlashlight from './HeroFlashlight';

export default function GuestHome() {
  const router = useRouter();
  const rooms: RoomSnapshotUI[] = Object.values(DUMMY_ROOMS as Record<string, RoomSnapshotUI>);

  const onClickRoom = (room: RoomSnapshotUI) => {
    router.push(`/study-rooms/${room.info.id}`);
  };

  return (
    <main className="w-full min-h-screen bg-background-base text-text-primary flex flex-col gap-16 items-center justify-center mb-5">
      {/* hero section */}
      <HeroFlashlight />

      {/* logo */}
      <section className="w-full flex flex-col justify-center items-center gap-16 pb-10">
        <div className="w-full flex flex-col gap-6">
          <MarqueeRow direction="ltr" />
          <h1 className="text-5xl font-bold tracking-wide text-center py-2">Catfé</h1>
          <MarqueeRow direction="rtl" />
        </div>
      </section>

      {/* 2x2 썸네일 그리드 */}
      <HoverInfoBox></HoverInfoBox>

      {/* 환영 타이틀 */}
      <section className="w-full max-w-6xl flex flex-col justify-center gap-10 md:pt-30 pt-20 pb-10 px-[100px]">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center">
          Catfé 에 방문하신 여러분 환영합니다!
        </h2>
        <span className='text-center text-xl md:text-2xl font-semibold'>👀 가장 최근에 개설된 캣페를 구경하세요 👀</span>
      </section>

      {/* 스터디룸 카드 3개 */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 pb-5 md:pb-6 justify-items-center px-[100px]">
        {rooms.slice(0, 3).map((room) => (
          <StudyRoomCard
            key={room.info.id}
            title={room.info.title}
            description={room.info.description}
            coverSrc={room.info.coverPreviewUrl}
            isPrivate={room.info.isPrivate}
            clickable
            onClick={() => onClickRoom(room)}
            className="w-full"
          />
        ))}
      </section>

      <Button
        size="lg"
        borderType="solid"
        color="primary"
        className="self-center mb-20"
        onClick={() => router.push('/study-rooms')}
      >
        👉🏻더 많은 스터디룸 구경하러 가기👈🏻
      </Button>
    </main>
  );
}
