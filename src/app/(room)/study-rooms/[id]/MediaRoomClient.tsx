'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import RoomStage from '@/components/study-room/RoomStage';
import MediaControlBar from '@/components/webrtc/MediaControlBar';
import { makeRtcConfig } from '@/lib/webrtcApi';
import { useWebRTC } from '@/hook/useWebRTC';
import { useMediaStream } from '@/hook/useMediaStream';
import { useRoomMembersQuery } from '@/hook/useRoomMembers';
import type {
  RoomSnapshotUI,
  StreamsByUser,
  UsersListItem,
  ApiRoomMemberDto,   
} from '@/@types/rooms';
import * as UITypes from '@/@types/rooms';
import SignalingClient from '@/lib/signalingClient';

const DEBUG = false;

/** STUN fallback */
const DEFAULT_RTC: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

/** ── id helpers ───────────────────────────────────────────────────────────── */
const toUid = (id: number | string) => `u-${Number(id) || 0}`;
const fromUid = (uid: string) => Number(String(uid).replace(/^u-/, '')) || 0;


type Props = {
  room: RoomSnapshotUI;
  meId: string; 
  signalingClient: SignalingClient;
};

export default function MediaRoomClient({
  room,
  meId: meIdProp,
  signalingClient,
}: Props) {
  /** 내 uid를 'u-<숫자>'로 정규화 */
  const myUid = useMemo(() => toUid(meIdProp), [meIdProp]);

  /** roomId: 타입 정의상 number */
  const roomId = room.info.id;
  const roomNum = roomId; // 이미 number

  if (DEBUG) console.log('[room] id=%s myUid=%s', roomId, myUid);

  /** 서버 멤버 목록 폴링 */
  const query = useRoomMembersQuery(roomNum, {
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 4000,
  });


  const membersDto: ApiRoomMemberDto[] = useMemo(
    () => (Array.isArray(query.data) ? (query.data as ApiRoomMemberDto[]) : []),
    [query.data]
  );

  /** 실시간 멤버 → UsersListItem으로 매핑( id:number ) */
  const liveMembers: UsersListItem[] = useMemo(() => {
    const myNum = fromUid(myUid);

    const arr: UsersListItem[] = membersDto.map((m: ApiRoomMemberDto) => ({
      id: Number(m.userId),
      name: m.nickname,
      role: (m.role as UITypes.Role) ?? 'MEMBER',
      email: m.email ?? '',
      avatarUrl: m.profileImageUrl ?? null,
      isMe: myNum > 0 ? Number(m.userId) === myNum : false,
      media: { camOn: true, screenOn: false },
    }));

    // 내 정보가 없으면 fallback
    if (myNum && !arr.some((x) => x.id === myNum)) {
      const fallback =
        room.members.find((x) => x.id === myNum) ??
        ({
          id: myNum,
          name: 'me',
          role: 'MEMBER',
          email: '',
          avatarUrl: null,
          isMe: true,
          media: { camOn: true, screenOn: false },
        } as UsersListItem);
      arr.push({ ...fallback, isMe: true });
    }
    return arr;
  }, [membersDto, myUid, room.members]);

  /** 방 스냅샷 멤버와 실시간 멤버를 id 기준으로 병합 */
  const unionMembers: UsersListItem[] = useMemo(() => {
    const map = new Map<string, UsersListItem>();
    for (const m of room.members) map.set(String(m.id), m);
    for (const m of liveMembers) map.set(String(m.id), m);
    return Array.from(map.values());
  }, [room.members, liveMembers]);

  /** 내 정보(num/string 동시 보유) */
  const me = useMemo(
    () => unionMembers.find((m) => m.isMe) ?? null,
    [unionMembers]
  );
  const meNum = me?.id ?? fromUid(myUid); // number
  const meId = toUid(meNum); // 'u-<num>' string

  /** 로컬 미디어 준비 */
  const { localStream, initMedia } = useMediaStream();
  useEffect(() => {
    initMedia();
  }, [initMedia]);

  /** RTC 설정 가져오기 (숫자만 서버로 전달) */
  const [rtcConfig, setRtcConfig] = useState<RTCConfiguration>(DEFAULT_RTC);
  useEffect(() => {
    (async () => {
      if (!meNum) return;
      try {
        const cfg = await makeRtcConfig({ userId: meNum, roomId: roomNum });
        setRtcConfig(cfg?.iceServers?.length ? cfg : DEFAULT_RTC);
      } catch (e) {
        setRtcConfig(DEFAULT_RTC);
        console.warn('[rtc] config fetch failed → fallback STUN only', e);
      }
    })();
  }, [meNum, roomNum]);

  /** WebRTC 대상 피어 id는 문자열 uid 배열 */
  const peerIds = useMemo(
    () => unionMembers.map((m) => toUid(m.id)),
    [unionMembers]
  );

  /** WebRTC 훅 (문자열만 넘김) */
  const {
    remoteStreams,
    callUser,
    signalingReady,
    micOn,
    camOn,
    isSharing,
    toggleMic,
    toggleCam,
    startScreenShare,
    stopScreenShare,
    localPreviewStream,
  } = useWebRTC({
    roomId: String(roomId), // string
    meId, // 'u-<num>'
    localStream,
    rtcConfig,
    signalingClient,
    peerIds, // 'u-<num>'[]
  });

  /** 피어 목록 변경 감지 → offer 트리거 */
  const lastPeerIdsRef = useRef<string>('');
  useEffect(() => {
    if (!localStream || !meId || !signalingReady) return;

    const candidates = unionMembers
      .filter((m) => !m.isMe && toUid(m.id) !== meId)
      .map((m) => toUid(m.id))
      .sort();

    const peerIdsKey = candidates.join(',');
    if (peerIdsKey === lastPeerIdsRef.current) return;
    lastPeerIdsRef.current = peerIdsKey;

    if (DEBUG) console.log('[offer-trigger] calling peers:', candidates);
    for (const pid of candidates) callUser(pid);
  }, [unionMembers, meId, localStream, callUser, signalingReady]);

  /** 렌더용 스트림 맵 (키 = uid 문자열) */
  const streamsByUser: StreamsByUser = useMemo(() => {
    const m: StreamsByUser = { ...remoteStreams };
    if (meId) m[meId] = localPreviewStream ?? localStream ?? null;
    return m;
  }, [remoteStreams, localPreviewStream, localStream, meId]);

  return (
    <>
      <RoomStage
        room={{
          ...room,
          members: unionMembers,
          info: { ...room.info, mediaEnabled: true },
        }}
        streamsByUser={streamsByUser}
      />
      <MediaControlBar
        className=""
        micOn={!!micOn}
        camOn={!!camOn}
        shareOn={!!isSharing}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleShare={() => (isSharing ? stopScreenShare() : startScreenShare())}
      />
    </>
  );
}
