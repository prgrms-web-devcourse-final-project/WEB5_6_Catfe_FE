"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StudyRoomCard from "@/components/study-room/StudyRoomCard";
import EnterPasswordModal from "@/components/study-room/EnterPasswordModal";
import { MOCK_PASSWORDS } from "@/lib/mockRoomPasswords";
import type { RoomDetail } from "@/@types/rooms";

type Props = {
  rooms: RoomDetail[];
};

export default function RoomsList({ rooms }: Props) {
  const router = useRouter();

  const [pwOpen, setPwOpen] = useState(false);
  const [pending, setPending] = useState<RoomDetail | null>(null);

  const enterRoom = (room: RoomDetail) => {
    if (room.private) {
      setPending(room);
      setPwOpen(true);
      return;
    }
    router.push(`/study-rooms/${room.roomId}`);
  };

  // 모달 닫기
  const closePw = () => {
    setPwOpen(false);
    setPending(null);
  };

  // 모달에서 비번 검증 성공 시 호출
  const handleSuccess = () => {
    if (!pending) return;
    const id = pending.roomId;
    closePw();
    router.push(`/study-rooms/${id}`);
  };

  if (!rooms.length) {
    return (
      <div className="w-full py-20 text-center text-text-secondary">
        아직 스터디룸이 없어요 😿
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-8 mb-16">
        {rooms.map((room) => (
          <StudyRoomCard
            key={room.roomId}
            title={room.title}
            description={room.description}
            coverSrc={null}
            isPrivate={room.private}
            clickable
            onClick={() => enterRoom(room)}
          />
        ))}
      </div>

      <EnterPasswordModal
        open={pwOpen}
        onClose={closePw}
        expectedPassword={
          pending ? MOCK_PASSWORDS[pending.roomId] ?? null : null
        }
        onSuccess={handleSuccess}
      />
    </>
  );
}
