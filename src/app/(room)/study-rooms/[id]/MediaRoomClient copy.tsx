// src/app/(room)/study-rooms/[id]/MediaRoomClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RoomStage from "@/components/study-room/RoomStage";
import { makeRtcConfig } from "@/lib/webrtcApi";
import { useWebRTC } from "@/hook/useWebRTC";
import { useMediaStream } from "@/hook/useMediaStream";
import type { RoomSnapshotUI, StreamsByUser, UsersListItem } from "@/@types/room";
import { getLocalUser, getMeIdFromLocal } from "@/utils/localUser";

/** "me-001" | "u-002" | "42" -> 숫자 부분으로 비교용 값 */
function idNum(id: string) {
  const part = id.split("-")[1] ?? id;
  const n = Number(part);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}
/** 내가 상대보다 아이디 숫자가 작으면 내가 오퍼 보낸다 */
function shouldInitiate(meId: string, peerId: string) {
  return idNum(meId) < idNum(peerId);
}

export default function MediaRoomClient({ room }: { room: RoomSnapshotUI }) {
  // 0) 로컬 유저로부터 meId 산출
  const localUser = getLocalUser();
  const meIdFromLocal = getMeIdFromLocal(); // "u-123" 형태 또는 null
  const fallbackMeId = room.members.find(m => m.isMe)?.id ?? room.members[0]?.id ?? "u-0";
  const meId = meIdFromLocal ?? fallbackMeId;

  // 0-1) room.members의 isMe 플래그를 meId 기준으로 동기화
  const patchedRoom: RoomSnapshotUI = {
    ...room,
    members: room.members.map<UsersListItem>((m) =>
      m.id === meId ? { ...m, isMe: true } : { ...m, isMe: false }
    ),
  };

  // 0-2) me가 멤버 목록에 아예 없다면(실제 백엔드 연동 전 더미 데이터일 수 있음) 표시용 멤버를 추가
  const hasMe = patchedRoom.members.some((m) => m.id === meId);
  const displayRoom: RoomSnapshotUI = hasMe
    ? patchedRoom
    : {
        ...patchedRoom,
        members: [
          ...patchedRoom.members,
          {
            id: meId,
            name: localUser?.nickname || localUser?.username || "me",
            role: "member",
            email: localUser?.email || "",
            avatarUrl: "/image/cat.png",
            isMe: true,
            media: { camOn: true, screenOn: false },
          } as UsersListItem,
        ],
      };

  const me = displayRoom.members.find((m) => m.isMe)!;

  // 1) 로컬 스트림
  const { localStream, initMedia } = useMediaStream();
  useEffect(() => {
    initMedia();
  }, [initMedia]);

  // 2) RTC 구성 불러오기
  const [rtcConfig, setRtcConfig] = useState<RTCConfiguration>({ iceServers: [] });
  useEffect(() => {
    (async () => {
      const cfg = await makeRtcConfig({
        userId: Number(me.id?.split("-")[1]) || 0,
        roomId: Number(displayRoom.info.id?.split("-")[1]) || 0,
      });
      setRtcConfig(cfg);
    })();
  }, [me.id, displayRoom.info.id]);

  // 3) P2P 훅
  const { remoteStreams, callUser } = useWebRTC({
    roomId: displayRoom.info.id,
    meId: me.id,                // ← signaling/useWebRTC와 동일한 meId 사용
    localStream,
    rtcConfig,
  });

  // 4) initiator 로직
  const startedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!localStream) return;

    const started = startedRef.current;
    const currentIds = new Set(displayRoom.members.map((m) => m.id));
    for (const pid of Array.from(started)) {
      if (!currentIds.has(pid)) started.delete(pid);
    }

    displayRoom.members
      .filter((m) => !m.isMe)
      .forEach((peer) => {
        if (started.has(peer.id)) return;
        if (!shouldInitiate(me.id, peer.id)) return;
        started.add(peer.id);
        setTimeout(() => callUser(peer.id), 120);
      });
  }, [displayRoom.members, me.id, localStream, callUser]);

  // 5) 타일용 스트림 맵: 원격 + 내 로컬
  const streamsByUser: StreamsByUser = useMemo(() => {
    const m: StreamsByUser = { ...remoteStreams };
    m[me.id] = localStream ?? null;
    return m;
  }, [remoteStreams, localStream, me.id]);

  return <RoomStage room={displayRoom} streamsByUser={streamsByUser} />;
}
