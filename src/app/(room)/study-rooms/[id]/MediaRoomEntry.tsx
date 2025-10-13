"use client";

import { useMemo } from "react";
import MediaRoomClient from "./MediaRoomClient";
import { useRoomInfoQuery } from "@/hook/useRoomInfo";
import { useRoomMembersQuery } from "@/hook/useRoomMembers";
import type { RoomSnapshotUI, UsersListItem, RoomInfo } from "@/@types/rooms";

function getMeUid(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    const id = u?.userId ?? u?.userid ?? u?.id ?? null;
    const n = typeof id === "string" ? Number(id) : id;
    return Number.isFinite(n) ? `u-${Number(n)}` : null;
  } catch { return null; }
}

export default function MediaRoomEntry({ roomNum }: { roomNum: number }) {
  const { data: infoDto } = useRoomInfoQuery(roomNum);
  const { data: membersDto = [] } = useRoomMembersQuery(roomNum, {
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const meUid = typeof window !== "undefined" ? getMeUid() : null;

  const roomUi: RoomSnapshotUI | null = useMemo(() => {
    if (!infoDto) return null;

    const info: RoomInfo = {
      id: infoDto.roomId,
      title: infoDto.title,
      description: infoDto.description ?? "",
      maxParticipants: infoDto.maxParticipants,
      isPrivate: !!infoDto.private,
      coverPreviewUrl: null,
      currentParticipants: infoDto.currentParticipants ?? 0,
      status: infoDto.status,
      allowCamera: !!infoDto.allowCamera,
      allowAudio: !!infoDto.allowAudio,
      allowScreenShare: !!infoDto.allowScreenShare,
      mediaEnabled: true,
    };

    const members: UsersListItem[] = membersDto.map((m) => ({
      id: m.userId,
      name: m.nickname,
      role: m.role,
      email: "",
      avatarUrl: m.profileImageUrl ?? null,
      isMe: meUid === `u-${m.userId}`,
      media: { camOn: true, screenOn: false },
      joinedAt: m.joinedAt ?? null,
    }));

    if (!members.some((x) => x.isMe) && meUid) {
      const n = Number(meUid.split("-")[1]);
      const i = members.findIndex((x) => x.id === n);
      if (i >= 0) members[i] = { ...members[i], isMe: true };
    }

    return { info, members };
  }, [infoDto, membersDto, meUid]);

  if (!roomUi) return null;
  return <MediaRoomClient room={roomUi} />;
}
