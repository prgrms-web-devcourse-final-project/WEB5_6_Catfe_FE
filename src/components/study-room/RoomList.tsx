"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StudyRoomCard from "@/components/study-room/StudyRoomCard";
import EnterPasswordModal from "@/components/study-room/EnterPasswordModal";
import { useRoomStore } from "@/stores/room.store";
import type { RoomSnapshot } from "@/@types/room";

export default function RoomList({ rooms }: { rooms: RoomSnapshot[] }) {
  const router = useRouter();
  const load = useRoomStore((s) => s.load);

  const [pwOpen, setPwOpen] = useState(false);
  const [pending, setPending] = useState<RoomSnapshot | null>(null);

  const enterRoom = (snap: RoomSnapshot) => {
    if (snap.info.isPrivate) {
      setPending(snap);
      setPwOpen(true);
      return;
    }
    load(snap);
    router.push(`/study-rooms/${snap.info.id}`);
  };

  const closePw = () => {
    setPwOpen(false);
    setPending(null);
  };

  const handleSuccess = () => {
    if (!pending) return;
    load(pending);
    const id = pending.info.id;
    closePw();
    router.push(`/study-rooms/${id}`);
  };

  return (
    <>
      <div className="w-full flex justify-center gap-5">
        {rooms.map((snap) => (
          <StudyRoomCard
            key={snap.info.id}
            title={snap.info.title}
            description={snap.info.description}
            coverSrc={snap.info.coverPreviewUrl}
            isPrivate={snap.info.isPrivate}
            clickable
            onClick={() => enterRoom(snap)}
          />
        ))}
      </div>

      <EnterPasswordModal
        open={pwOpen}
        onClose={closePw}
        expectedPassword={pending?.info.password ?? null} // ← 여기서 기대 비번 제공
        onSuccess={handleSuccess}
      />
    </>
  );
}
