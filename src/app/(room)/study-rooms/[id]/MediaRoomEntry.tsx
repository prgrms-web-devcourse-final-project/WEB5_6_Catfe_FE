"use client";

import { useEffect, useMemo, useRef } from "react";
import MediaRoomClient from "./MediaRoomClient";
import { useRoomInfoQuery } from "@/hook/useRoomInfo";
import { useRoomMembersQuery } from "@/hook/useRoomMembers";
import type { RoomSnapshotUI, UsersListItem, RoomInfo, ApiRoomMemberDto } from "@/@types/rooms";
import SignalingClient from "@/lib/signalingClient";

/** 로컬 스토리지 → 'u-<num>' 형태 meUid */
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

  // 브라우저에서만 meUid를 읽음
  const meUid = typeof window !== "undefined" ? getMeUid() : null;

  /** RoomSnapshotUI 구성 */
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

    // 혹시 내 정보가 목록에 없을 때 보정
    if (meUid && !members.some((x) => x.isMe)) {
      const n = Number(meUid.split("-")[1]);
      const i = members.findIndex((x) => x.id === n);
      if (i >= 0) members[i] = { ...members[i], isMe: true };
    }

    return { info, members };
  }, [infoDto, membersDto, meUid]);

  /** ---- SignalingClient 생성/해제 ---- */
  const signalingRef = useRef<SignalingClient | null>(null);

  useEffect(() => {
    // roomUi랑 meUid가 준비된 뒤에 생성
    if (!roomUi || !meUid) return;

    // 이미 있으면 건너뜀
    if (signalingRef.current) return;

    const userIdForWS = meUid.split("-")[1] ?? ""; 
    const client = new SignalingClient(String(roomNum), userIdForWS, () => {
    });
    signalingRef.current = client;

    return () => {
      // 언마운트/room 변경 시 해제
      try { signalingRef.current?.disconnect(); } finally {
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
