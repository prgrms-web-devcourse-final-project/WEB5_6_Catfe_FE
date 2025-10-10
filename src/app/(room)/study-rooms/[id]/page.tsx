// src/app/(room)/study-rooms/[id]/page.tsx

import type { RoomSnapshotUI, RoomInfo, UsersListItem } from "@/@types/room";
import MediaRoomClient from "./MediaRoomClient"; 
import RoomStage from "@/components/study-room/RoomStage";

async function getRoom(roomId: string): Promise<RoomSnapshotUI> {
  const info: RoomInfo = {
    id: roomId,
    title: "우리의 방",
    description: "테스트용",
    maxMember: 4,            // ✅ 4명 고정
    isPrivate: false,
    password: null,
    coverPreviewUrl: null,
    mediaEnabled: true,      // ✅ 미디어 방 고정
  };

  const members: UsersListItem[] = [
    {
      id: "me-001",
      name: "나",
      role: "owner",
      email: "me@test.dev",
      avatarUrl: "/image/cat.png",
      isMe: true,
      media: { camOn: true, screenOn: false },
    },
    {
      id: "u-002",
      name: "짱구",
      role: "member",
      email: "zzang@dev.to",
      avatarUrl: null,
      media: { camOn: false, screenOn: false },
    },
  ];

  return { info, members };
}

export default async function StudyRoomPage({ params }: { params: { id: string } }) {
  const room = await getRoom(params.id);
  // ✅ 미디어 방만 렌더
  return <MediaRoomClient room={room} />;
}
