"use client";

import Image from "next/image";
import WalkingCat from "./WalkingCat";
import { useRouter } from "next/navigation";
import StudyRoomCard from "@/components/study-room/StudyRoomCard";
import { DUMMY_ROOMS } from "@/mock/rooms";
import Button from "../Button";
import type { RoomSnapshotUI } from "@/@types/room";

export default function GuestHome() {

  const router = useRouter();
  const rooms: RoomSnapshotUI[] = Object.values(
    DUMMY_ROOMS as Record<string, RoomSnapshotUI>
  );

  const onClickRoom = (room: RoomSnapshotUI) => {
    router.push(`/study-rooms/${room.info.id}`);
  };

  return (
    <main className="w-full min-h-screen bg-background-base text-text-primary flex flex-col gap-16 items-center justify-center mb-5 ">
      {/* hero section */}
      <section className="w-full h-[60vh] bg-secondary-500 flex items-center justify-center">
        <div className="text-3xl md:text-5xl font-semibold">hero section</div>
      </section>

      {/* logo */}
      <section className="w-full flex flex-col justify-center items-center gap-16 py-5 md:py-6">
        <WalkingCat />
      </section>

      {/* 2x2 썸네일 그리드 */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12.5 py-5 md:py-6 justify-items-center">
        <div className="aspect-[16/10] w-full bg-secondary-200 border border-black/10 rounded-xl grid place-items-center">
          📷
        </div>
        <div className="aspect-[16/10] w-full bg-secondary-200 border border-black/10 rounded-xl grid place-items-center">
          📷
        </div>
        <div className="aspect-[16/10] w-full bg-secondary-200 border border-black/10 rounded-xl grid place-items-center">
          📷
        </div>
        <div className="aspect-[16/10] w-full bg-secondary-200 border border-black/10 rounded-xl grid place-items-center">
          📷
        </div>
      </section>

      {/* 환영 타이틀 */}
      <section className="w-full max-w-6xl flex justify-center gap-5 py-5 md:py-6">
        <Image
            src="/image/cat-default.svg"
            alt="캣페 마스코트"
            width={32}
            height={32}
          />
        <h2 className="text-4xl font-extrabold text-center">
          catfé 에 방문하신 여러분 환영합니다!
        </h2>
        <Image
            src="/image/cat-default.svg"
            alt="캣페 마스코트"
            width={32}
            height={32 }
          />
      </section>

      {/* 통계 3칸 */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 py-5 md:py-6justify-items-center">
        <div className="h-28 w-full rounded-xl p-4 flex flex-col justify-center items-center text-center">
          <div className="text-sm text-text-primary">전체 멤버수</div>
          <div className="text-3xl font-bold text-primary">00</div>
        </div>
        <div className="h-28 w-full rounded-xl p-4 flex flex-col justify-center items-center text-center">
          <div className="text-sm text-text-primary">현재 접속중인 고양이</div>
          <div className="text-3xl font-bold text-primary">00</div>
        </div>
        <div className="h-28 w-full rounded-xl p-4 flex flex-col justify-center items-center text-center">
          <div className="text-sm text-text-primary">전체 가입방</div>
          <div className="text-3xl font-bold text-primary">00</div>
        </div>
      </section>

      {/* 스터디룸 카드 3개 */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-5 md:py-6 justify-items-center">
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
        className="self-center"
        onClick={() => router.push("/study-rooms")}
        >
          👉🏻더 많은 스터디룸 구경하러 가기👈🏻
      </Button>

    </main>
  );
}
