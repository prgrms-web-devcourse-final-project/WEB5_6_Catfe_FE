// src/app/(room)/study-rooms/[id]/MediaRoomClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RoomStage from "@/components/study-room/RoomStage";
import { makeRtcConfig } from "@/lib/webrtcApi";
import { useWebRTC } from "@/hook/useWebRTC";
import { useMediaStream } from "@/hook/useMediaStream";
import type { RoomSnapshotUI, StreamsByUser } from "@/@types/room";

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
  const me = room.members.find((m) => m.isMe)!;

  // 1) 로컬 스트림 (마운트 1회 초기화)
  const { localStream, initMedia } = useMediaStream();
  useEffect(() => {
    initMedia();
  }, [initMedia]);

  // 2) RTC 구성: 훅을 조건부로 부르지 않기 위해 빈 설정으로 시작 후 갱신
  const [rtcConfig, setRtcConfig] = useState<RTCConfiguration>({ iceServers: [] });
  useEffect(() => {
    (async () => {
      const cfg = await makeRtcConfig({
        userId: Number(me.id?.split("-")[1]) || 0,
        roomId: Number(room.info.id?.split("-")[1]) || 0,
      });
      setRtcConfig(cfg);
    })();
  }, [me.id, room.info.id]);

  // 3) P2P 훅 (항상 호출) — config은 이후 갱신되어도 문제 없음
  const { remoteStreams, callUser } = useWebRTC({
    roomId: room.info.id,
    meId: me.id,
    localStream,
    rtcConfig,
  });

  // 4) 최초 오퍼 발신: 내가 initiator 인 피어들에게만 "딱 1번씩"
  const startedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!localStream) return; // 트랙 준비되면 시작

    const started = startedRef.current;

    // 방에서 나간 사용자 정리
    const currentIds = new Set(room.members.map((m) => m.id));
    for (const pid of Array.from(started)) {
      if (!currentIds.has(pid)) started.delete(pid);
    }

    room.members
      .filter((m) => !m.isMe)
      .forEach((peer) => {
        if (started.has(peer.id)) return; // 이미 시도
        if (!shouldInitiate(me.id, peer.id)) return; // 내가 오퍼 주체 아님
        started.add(peer.id);

        // 장치/트랙 준비 안정성을 위한 짧은 지연
        setTimeout(() => {
          callUser(peer.id);
        }, 120);
      });
  }, [room.members, me.id, localStream, callUser]);

  // 5) 타일용 스트림 맵: 원격 + 내 로컬
  const streamsByUser: StreamsByUser = useMemo(() => {
    const m: StreamsByUser = { ...remoteStreams };
    m[me.id] = localStream ?? null;
    return m;
  }, [remoteStreams, localStream, me.id]);

  return <RoomStage room={room} streamsByUser={streamsByUser} />;
}
