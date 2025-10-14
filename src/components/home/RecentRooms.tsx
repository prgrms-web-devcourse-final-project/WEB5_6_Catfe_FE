"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import StudyRoomCard from "@/components/study-room/StudyRoomCard";
import { getAllRooms } from "@/api/apiRooms";
import type { AllRoomsList } from "@/@types/rooms";
import useRequireLogin from "@/hook/useRequireLogin";

const PAGE = 0;
const SIZE = 20;

export default function RecentRooms() {
  const router = useRouter();
  const requireLogin = useRequireLogin();
  const [rooms, setRooms] = useState<AllRoomsList[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllRooms(PAGE, SIZE);
        const top3 = (res.content ?? []).slice(0, 3);
        setRooms(top3);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "전체 스터디룸 목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCardClick = useCallback(
    (roomId: number) => {
      const next = `/study-rooms/${roomId}`;
      if (!requireLogin(next)) return;
      router.push(next);
    },
    [requireLogin, router]
  );

  if (loading) {
    return (
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-5 md:pb-6 justify-items-center">
        {[0, 1, 2].map((k) => (
          <div key={k} className="w-full h-48 rounded-xl bg-black/5 animate-pulse" />
        ))}
      </section>
    );
  }

  if (err) {
    return <div className="px-4 py-5 text-red-500">{err}</div>;
  }

  if (rooms.length === 0) {
    return <div className="px-4 py-5">표시할 방이 없어요.</div>;
  }

  return (
    <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-5 md:pb-6 justify-items-center">
      {rooms.map((room) => (
        <StudyRoomCard
          key={room.roomId}
          title={room.title}
          description={room.description}
          coverSrc={room.thumbnailUrl ?? null}
          isPrivate={room.isPrivate}
          clickable
          onClick={() => handleCardClick(room.roomId)}
          className="w-full"
        />
      ))}
    </section>
  );
}
