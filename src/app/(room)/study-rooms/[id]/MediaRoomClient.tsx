'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import RoomStage from '@/components/study-room/RoomStage';
import { makeRtcConfig } from '@/lib/webrtcApi';
import { useWebRTC } from '@/hook/useWebRTC';
import { useMediaStream } from '@/hook/useMediaStream';
import { useRoomMembersQuery } from '@/hook/useRoomMembers';
import type { RoomSnapshotUI, StreamsByUser, UsersListItem, ApiRoomMemberDto } from '@/@types/rooms';
import * as UITypes from '@/@types/rooms';
import SignalingClient from '@/lib/signalingClient';
import { useSetMediaControls } from '@/contexts/MediaControlsContext';

const DEFAULT_RTC: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const toUid = (id: number | string) => `u-${Number(id) || 0}`;
const fromUid = (uid: string) => Number(String(uid).replace(/^u-/, '')) || 0;

type Props = {
  room: RoomSnapshotUI;
  meId: string;
  signalingClient: SignalingClient;
};

type MediaFlags = { micOn?: boolean; camOn?: boolean; screenOn?: boolean };

export default function MediaRoomClient({ room, meId: meIdProp, signalingClient }: Props) {
  const myUid = useMemo(() => toUid(meIdProp), [meIdProp]);
  const roomNum = room.info.id;

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

  const liveMembers: UsersListItem[] = useMemo(() => {
    const myNum = fromUid(myUid);
    const arr: UsersListItem[] = membersDto.map((m) => ({
      id: Number(m.userId),
      name: m.nickname,
      role: (m.role as UITypes.Role) ?? 'MEMBER',
      email: m.email ?? '',
      avatarUrl: m.profileImageUrl ?? null,
      isMe: myNum > 0 ? Number(m.userId) === myNum : false,
      media: { camOn: true, screenOn: false },
    }));
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

  const unionMembers = useMemo(() => {
    const map = new Map<string, UsersListItem>();
    for (const m of room.members) map.set(String(m.id), m);
    for (const m of liveMembers) map.set(String(m.id), m);
    return Array.from(map.values());
  }, [room.members, liveMembers]);

  const me = useMemo(() => unionMembers.find((m) => m.isMe) ?? null, [unionMembers]);
  const meNum = me?.id ?? fromUid(myUid);
  const meId = toUid(meNum);

  const { localStream, initMedia } = useMediaStream();
  useEffect(() => { initMedia(); }, [initMedia]);

  const [rtcConfig, setRtcConfig] = useState<RTCConfiguration>(DEFAULT_RTC);
  useEffect(() => {
    (async () => {
      if (!meNum) return;
      try {
        const cfg = await makeRtcConfig({ userId: meNum, roomId: roomNum });
        setRtcConfig(cfg?.iceServers?.length ? cfg : DEFAULT_RTC);
      } catch {
        setRtcConfig(DEFAULT_RTC);
      }
    })();
  }, [meNum, roomNum]);

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
    roomId: String(roomNum),
    meId,
    localStream,
    rtcConfig,
    signalingClient,
    peerIds: unionMembers.map((m) => toUid(m.id)),
  });

  const lastPeerIdsRef = useRef<string>('');
  useEffect(() => {
    if (!localStream || !meId || !signalingReady) return;
    const candidates = unionMembers
      .filter((m) => !m.isMe && toUid(m.id) !== meId)
      .map((m) => toUid(m.id))
      .sort();
    const key = candidates.join(',');
    if (key === lastPeerIdsRef.current) return;
    lastPeerIdsRef.current = key;
    for (const pid of candidates) callUser(pid);
  }, [unionMembers, meId, localStream, callUser, signalingReady]);

  const streamsByUser: StreamsByUser = useMemo(() => {
    const m: StreamsByUser = { ...remoteStreams };
    if (meId) m[meId] = localPreviewStream ?? localStream ?? null;
    return m;
  }, [remoteStreams, localPreviewStream, localStream, meId]);

  const [remoteMedia, setRemoteMedia] = useState<Record<string, MediaFlags>>({});
  useEffect(() => {
    const handler = (fromUserId: string, state: { mediaType: 'AUDIO' | 'VIDEO' | 'SCREEN'; enabled: boolean }) => {
      setRemoteMedia((prev) => {
        const k = `u-${Number(fromUserId) || 0}`;
        const next: MediaFlags = { ...(prev[k] || {}) };
        if (state.mediaType === 'AUDIO') next.micOn = state.enabled;
        if (state.mediaType === 'VIDEO') next.camOn = state.enabled;
        if (state.mediaType === 'SCREEN') next.screenOn = state.enabled;
        return { ...prev, [k]: next };
      });
    };
    signalingClient.addMediaStateListener(handler);
    return () => signalingClient.removeMediaStateListener(handler);
  }, [signalingClient]);

  const setControls = useSetMediaControls();
  useEffect(() => {
    if (!setControls) return;
    setControls({
      micOn: !!micOn,
      camOn: !!camOn,
      shareOn: !!isSharing,
      toggleMic,
      toggleCam,
      toggleShare: () => (isSharing ? stopScreenShare() : startScreenShare()),
    });
    return () => setControls(null);
  }, [micOn, camOn, isSharing, toggleMic, toggleCam, startScreenShare, stopScreenShare, setControls]);

  const selfMedia: MediaFlags = { micOn, camOn, screenOn: isSharing };

  return (
    <>
      <RoomStage
        room={{ ...room, members: unionMembers, info: { ...room.info, mediaEnabled: true } }}
        streamsByUser={streamsByUser}
        mediaSelf={selfMedia}
        mediaRemote={remoteMedia}
      />
    </>
  );
}
