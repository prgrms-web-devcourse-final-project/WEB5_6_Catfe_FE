'use client';

import { useEffect, useMemo, useRef } from "react";
import MediaRoomClient from "./MediaRoomClient";
import { useRoomInfoQuery } from "@/hook/useRoomInfo";
import { useRoomMembersQuery } from "@/hook/useRoomMembers";
import type { RoomSnapshotUI, UsersListItem, RoomInfo, ApiRoomMemberDto } from "@/@types/rooms";
import SignalingClient from "@/lib/signalingClient";

function getMeUid(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    const id = u?.userId ?? u?.userid ?? u?.id ?? null;
    const n = typeof id === "string" ? Number(id) : id;
    return Number.isFinite(n) ? `u-${Number(n)}` : null;
  } catch {
    return null;
  }
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

    const members: UsersListItem[] = (membersDto as ApiRoomMemberDto[]).map((m) => ({
      id: typeof m.userId === "string" ? Number(m.userId) : m.userId,
      name: m.nickname,
      role: m.role ?? "MEMBER",
      email: m.email ?? "",
      avatarUrl: m.profileImageUrl ?? null,
      isMe: meUid === `u-${Number(m.userId)}`,
      media: { camOn: true, screenOn: false },
      joinedAt: null,
    }));

    if (meUid && !members.some((x) => x.isMe)) {
      const n = Number(meUid.split("-")[1]);
      const i = members.findIndex((x) => x.id === n);
      if (i >= 0) members[i] = { ...members[i], isMe: true };
    }

    return { info, members };
  }, [infoDto, membersDto, meUid]);

  const signalingRef = useRef<SignalingClient | null>(null);

  useEffect(() => {
    if (!roomUi || !meUid) return;
    if (signalingRef.current) return;

    const userIdForWS = meUid.split("-")[1] ?? "";
    const client = new SignalingClient(String(roomNum), userIdForWS, () => {});
    signalingRef.current = client;

    return () => {
      try {
        signalingRef.current?.disconnect();
      } finally {
        signalingRef.current = null;
      }
    };
  }, [roomUi, meUid, roomNum]);

  if (!roomUi || !meUid || !signalingRef.current) return null;

  return (
    <MediaRoomClient
      room={roomUi}
      meId={meUid}
      signalingClient={signalingRef.current}
    />
  );
}
