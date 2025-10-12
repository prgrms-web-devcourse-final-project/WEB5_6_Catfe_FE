'use client';

<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from 'react';
import RoomStage from '@/components/study-room/RoomStage';
import { makeRtcConfig } from '@/lib/webrtcApi';
import { useWebRTC } from '@/hook/useWebRTC';
import { useMediaStream } from '@/hook/useMediaStream';
import { useRoomMembersQuery } from '@/hook/useRoomMembers';
import type { RoomSnapshotUI, StreamsByUser, UsersListItem } from '@/@types/room';

const DEBUG = false;

=======
import { useEffect, useMemo, useRef, useState } from "react";
import RoomStage from "@/components/study-room/RoomStage";
import { makeRtcConfig } from "@/lib/webrtcApi";
import { useWebRTC } from "@/hook/useWebRTC";
import { useMediaStream } from "@/hook/useMediaStream";
import type { RoomSnapshotUI, StreamsByUser, UsersListItem } from "@/@types/room";
import { getLocalUser, getMeIdFromLocal } from "@/utils/localUser";

/** 숫자 비교용 */
>>>>>>> 7b9b1ce (브랜치 최신화)
function idNum(id: string) {
  const p = id.split('-')[1] ?? id;
  const n = Number(p);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}
function shouldInitiate(meId: string, peerId: string) {
  return idNum(meId) < idNum(peerId);
}
const DEFAULT_RTC: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

function getMyUidFromLocal(): string | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    const id = u?.userId ?? u?.userid ?? u?.UserId ?? u?.id ?? u?.user_id ?? u?.ID ?? null;
    const n = typeof id === 'string' ? Number(id) : id;
    return Number.isFinite(n) ? `u-${Number(n)}` : null;
  } catch { return null; }
}

/** 게이트: 마운트 전에는 아무것도 렌더하지 않음 */
export default function MediaRoomClient({ room }: { room: RoomSnapshotUI }) {
<<<<<<< HEAD
  // 0) 내 uid 확정 (로컬 → 스냅샷 me → null)
  const myUid = useMemo(
    () =>
      (typeof window !== 'undefined' ? getMyUidFromLocal() : null) ??
      room.members.find((m) => m.isMe)?.id ??
      null,
    [room.members]
  );

  const roomId = room.info.id;
  const roomNum = useMemo(() => Number(roomId.split('-')[1] ?? roomId) || 0, [roomId]);

  // 1) 실시간 멤버(폴링)
  const { data: membersDto = [] } = useRoomMembersQuery(roomNum, {
    refetchInterval: 8000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  // DTO → UI + me 보정
  const liveMembers: UsersListItem[] = useMemo(() => {
    const arr: UsersListItem[] = membersDto.map((m) => ({
      id: `u-${m.userId}`,
      name: m.nickname,
      role: m.role === 'HOST' ? 'owner' : 'member',
      email: '',
      avatarUrl: m.profileImageUrl ?? null,
      isMe: myUid ? m.userId === Number(myUid.split('-')[1]) : false,
      media: { camOn: true, screenOn: false },
    }));

    if (myUid && !arr.some((x) => x.id === myUid)) {
      const fallback =
        room.members.find((x) => x.id === myUid) ??
        ({
          id: myUid,
          name: 'me',
          role: 'member',
          email: '',
          avatarUrl: null,
          isMe: true,
          media: { camOn: true, screenOn: false },
        } as UsersListItem);
      arr.push({ ...fallback, isMe: true });
    }

    if (DEBUG) console.log('[ui] liveMembers:', arr.map((m) => `${m.id}${m.isMe ? '(me)' : ''}`));
    return arr;
  }, [membersDto, myUid, room.members]);

  // 합집합(스냅샷+라이브)
  const unionMembers: UsersListItem[] = useMemo(() => {
    const map = new Map<string, UsersListItem>();
    for (const m of room.members) map.set(m.id, m);
    for (const m of liveMembers) map.set(m.id, m);
    const merged = Array.from(map.values());
    if (DEBUG) console.log('[ui] unionMembers:', merged.map((m) => `${m.id}${m.isMe ? '(me)' : ''}`));
    return merged;
  }, [room.members, liveMembers]);

  // me 식별자
  const me = useMemo(
    () => room.members.find((m) => m.isMe) ?? liveMembers.find((m) => m.isMe) ?? null,
    [room.members, liveMembers]
  );
  const meId = me?.id ?? myUid ?? null; 

  // 2) 로컬 스트림
=======
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <MediaRoomInner room={room} />;
}

/** 실제 훅/로직은 이 안쪽 컴포넌트에서만 사용 */
function MediaRoomInner({ room }: { room: RoomSnapshotUI }) {
  // 0) 로컬 유저로부터 meId 산출 및 members 동기화
  const localUser = getLocalUser();
  const meIdFromLocal = getMeIdFromLocal(); // "u-123" | null
  const fallbackMeId = room.members.find((m) => m.isMe)?.id ?? room.members[0]?.id ?? "u-0";
  const meId = meIdFromLocal ?? fallbackMeId;

  const patchedRoom: RoomSnapshotUI = {
    ...room,
    members: room.members.map<UsersListItem>((m) =>
      m.id === meId ? { ...m, isMe: true } : { ...m, isMe: false }
    ),
  };

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
>>>>>>> 7b9b1ce (브랜치 최신화)
  const { localStream, initMedia } = useMediaStream();
  useEffect(() => { initMedia(); }, [initMedia]);

<<<<<<< HEAD
  // 3) RTC Config (백엔드 ICE 서버 사용, 실패 시 STUN)
  const [rtcConfig, setRtcConfig] = useState<RTCConfiguration>(DEFAULT_RTC);
  useEffect(() => {
    (async () => {
      if (!meId) return; 
      try {
        const meNum = Number((meId || '').split('-')[1] ?? meId) || 0;
        const cfg = await makeRtcConfig({ userId: meNum, roomId: roomNum });
        const next = cfg?.iceServers?.length ? cfg : DEFAULT_RTC;
        setRtcConfig(next);
        if (DEBUG) console.log('[rtc] config:', next.iceServers);
      } catch (e) {
        setRtcConfig(DEFAULT_RTC);
        console.warn('[rtc] config fetch failed → fallback STUN only', e);
      }
    })();
  }, [meId, roomNum]);

  // 4) WebRTC
  const { remoteStreams, callUser } = useWebRTC({
    roomId,
    meId: meId ?? '__unknown__',
=======
  // 2) RTC 구성
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
    meId: me.id,
>>>>>>> 7b9b1ce (브랜치 최신화)
    localStream,
    rtcConfig,
  });

<<<<<<< HEAD
  // 5) 발신 트리거 — 신규 피어에게만, 그리고 내가 더 작은 id일 때만 OFFER
=======
  // 4) initiator 로직
>>>>>>> 7b9b1ce (브랜치 최신화)
  const startedRef = useRef<Set<string>>(new Set());
  const lastPeerIdsRef = useRef<string>('');
  useEffect(() => {
<<<<<<< HEAD
    if (!localStream || !meId) {
      if (DEBUG) console.log('[offer] skip: localStream or meId not ready', { hasStream: !!localStream, meId });
      return;
    }

    const candidates = unionMembers
      .filter((m) => !m.isMe && m.id !== meId)
      .map((m) => m.id)
      .sort();
    const peerIds = candidates.join(',');

    if (peerIds === lastPeerIdsRef.current) return; 
    lastPeerIdsRef.current = peerIds;

    const started = startedRef.current;
    const currentSet = new Set(candidates);

    // 빠진 피어 정리
    for (const pid of Array.from(started)) {
      if (!currentSet.has(pid)) started.delete(pid);
    }

    // 신규 피어에 대해서만, 내가 더 작은 id면 OFFER
    for (const pid of candidates) {
      if (started.has(pid)) continue;
      if (!shouldInitiate(meId, pid)) continue;

      started.add(pid);
      if (DEBUG) console.log('[offer] to', pid, 'from', meId);
      // 살짝 지연시켜 트랙 부착이 끝난 뒤 전송
      setTimeout(() => callUser(pid), 120);
    }
  }, [unionMembers, meId, localStream, callUser]);

  // 6) 렌더 스트림(내 로컬 포함)
=======
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

  // 5) 타일용 스트림 맵
>>>>>>> 7b9b1ce (브랜치 최신화)
  const streamsByUser: StreamsByUser = useMemo(() => {
    const m: StreamsByUser = { ...remoteStreams };
    if (meId) m[meId.startsWith('u-') ? meId : `u-${meId}`] = localStream ?? null;

<<<<<<< HEAD
    if (DEBUG) {
      console.log('[render] meId:', meId, 'members:', Object.keys(m).sort().join(','));
    }
    return m;
  }, [remoteStreams, localStream, meId]);

  return (
    <RoomStage
      room={{
        ...room,
        members: liveMembers,
        info: { ...room.info, mediaEnabled: true },
      }}
      streamsByUser={streamsByUser}
    />
  );
=======
  return <RoomStage room={displayRoom} streamsByUser={streamsByUser} />;
>>>>>>> 7b9b1ce (브랜치 최신화)
}
