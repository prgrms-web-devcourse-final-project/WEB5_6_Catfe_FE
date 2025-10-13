"use client";

import { useMemo } from "react";
import MediaRoomClient from "./MediaRoomClient";
import { useRoomInfoQuery } from "@/hook/useRoomInfo";
import { useRoomMembersQuery } from "@/hook/useRoomMembers";
import type { RoomSnapshotUI, UsersListItem, RoomInfo } from "@/@types/room";

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
      id: String(infoDto.roomId),
      title: infoDto.title,
      description: infoDto.description ?? null,
      maxMember: infoDto.maxParticipants,
      isPrivate: !!infoDto.private,
      password: null,
      coverPreviewUrl: null,
      // 스트림만 있으면 그리므로 true로 고정
      mediaEnabled: true,
    };

    const members: UsersListItem[] = membersDto.map((m) => ({
      id: `u-${m.userId}`,
      name: m.nickname,
      role: m.role === "HOST" ? "owner" : "member",
      email: "",
      avatarUrl: m.profileImageUrl ?? null,
      isMe: meUid === `u-${m.userId}`,
      media: { camOn: true, screenOn: false },
    }));

    // isMe가 하나도 못 찍히면 fallback
    if (!members.some((x) => x.isMe) && meUid) {
      const i = members.findIndex((x) => x.id === meUid);
      if (i >= 0) members[i] = { ...members[i], isMe: true };
    }

    return { info, members };
  }, [infoDto, membersDto, meUid]);

  if (!roomUi) return null;
  return <MediaRoomClient room={roomUi} />;
}
