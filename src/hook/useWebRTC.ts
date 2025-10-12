'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WebRTCSignal } from '@/lib/types';
import SignalingClient from '@/lib/signalingClient';

<<<<<<< HEAD
const DEBUG = true;
const dlog = (...a: unknown[]) => { if (DEBUG) console.log(...a); };


function sigKey(id: string | number): string {
  const s = String(id);
  const p = s.split('-')[1] ?? s;
  const n = Number(p);
  return Number.isFinite(n) ? String(n) : s;
}
/** 표시용 키: 항상 "u-<숫자>" */
function displayKey(k: string): string {
  return k.startsWith('u-') ? k : `u-${k}`;
}
/** 비교용 숫자 id */
function idNum(id: string | number): number {
  const s = String(id);
  const p = s.split('-')[1] ?? s;
  const n = Number(p);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

/* ---------------- Track sync helpers ---------------- */
function upsertSender(pc: RTCPeerConnection, track: MediaStreamTrack, stream: MediaStream): void {
  const kind = track.kind;
  const sender = pc.getSenders().find(s => s.track?.kind === kind);
  if (sender?.track?.id === track.id) return;       
  if (sender) {
    dlog('[rtc] replaceTrack', kind);
    void sender.replaceTrack(track);
  } else {
    dlog('[rtc] addTrack', kind);
    pc.addTrack(track, stream);
  }
}
function syncLocalTracksToPc(pc: RTCPeerConnection, localStream: MediaStream | null): void {
  if (!localStream) return;
  const a = localStream.getAudioTracks?.()[0] ?? null;
  const v = localStream.getVideoTracks?.()[0] ?? null;
  if (a) upsertSender(pc, a, localStream);
  if (v) upsertSender(pc, v, localStream);
}
/* ----------------------------------------------------- */

type PeerConnections = Record<string, RTCPeerConnection>;
type RemoteStreams = Record<string, MediaStream>;

=======
function sigKey(id: string | number) {
  const s = String(id);
  const part = s.split('-')[1] ?? s;      // "u-002" -> "002"
  const n = Number(part);
  return Number.isFinite(n) ? String(n) : s; // "002" -> "2"
}

>>>>>>> 7b9b1ce (브랜치 최신화)
export function useWebRTC(params: {
  roomId: string;
  meId: string;                 
  localStream: MediaStream | null;
  rtcConfig: RTCConfiguration;
}) {
  const { roomId, meId, localStream, rtcConfig } = params;

  const [peers, setPeers] = useState<PeerConnections>({});
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreams>({});
  const peersRef = useRef<PeerConnections>({});
  useEffect(() => { peersRef.current = peers; }, [peers]);

<<<<<<< HEAD
  // remoteDescription 이전 수신 ICE 후보 큐
=======
  // ICE 후보 큐 (remoteDescription 세팅 전 도착 대비)
>>>>>>> 7b9b1ce (브랜치 최신화)
  const pendingIceMap = useRef<Record<string, RTCIceCandidateInit[]>>({});

  // 시그널링
  const signalingRef = useRef<SignalingClient | null>(null);

<<<<<<< HEAD
  // 트랙 id 메모(의존성 단순화)
  const audioTrackId = useMemo(
    () => localStream?.getAudioTracks?.()[0]?.id ?? '',
    [localStream]
  );
  const videoTrackId = useMemo(
    () => localStream?.getVideoTracks?.()[0]?.id ?? '',
    [localStream]
  );

  const createPeerConnection = useCallback((key: string): RTCPeerConnection => {
    const exist = peersRef.current[key];
    if (exist) return exist;
=======
    const onSignal = async (signal: WebRTCSignal) => {
      console.log('[SIG<-]', signal.type, signal);
      const { type, fromUserId, sdp, candidate } = signal;
      const k = sigKey(fromUserId);

      let pc = peersRef.current[k];
      if (!pc) pc = createPeerConnection(k);

      if (type === 'offer' && sdp) {
        await pc.setRemoteDescription(sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        signalingRef.current?.sendSignal({
          type: 'answer',
          fromUserId: meId,
          toUserId: fromUserId, // 서버로는 원본 id 전달
          sdp: answer,
        });

        const queued = pendingIceMap.current[k] || [];
        for (const c of queued) await pc.addIceCandidate(new RTCIceCandidate(c));
        pendingIceMap.current[k] = [];

      } else if (type === 'answer' && sdp) {
        await pc.setRemoteDescription(sdp);

        const queued = pendingIceMap.current[k] || [];
        for (const c of queued) await pc.addIceCandidate(new RTCIceCandidate(c));
        pendingIceMap.current[k] = [];

      } else if (type === 'ice' && candidate) {
        if (pc.remoteDescription?.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          (pendingIceMap.current[k] ||= []).push(candidate);
        }
      }
    };

    signalingRef.current = new SignalingClient(roomId, meId, onSignal);

    return () => {
      signalingRef.current?.disconnect();
      signalingRef.current = null;

      setPeers((prev) => { Object.values(prev).forEach((pc) => pc.close()); return {}; });
      setRemoteStreams({});
      pendingIceMap.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, meId]);

  function createPeerConnection(key: string) {
    const existing = peersRef.current[key];
    if (existing) return existing;
>>>>>>> 7b9b1ce (브랜치 최신화)

    const pc = new RTCPeerConnection(rtcConfig);
    dlog('[rtc] new RTCPeerConnection for', key, rtcConfig.iceServers);

    // 초기 트랙 부착(중복 방지)
    syncLocalTracksToPc(pc, localStream);

<<<<<<< HEAD
    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        dlog('[rtc] onnegotiationneeded -> OFFER to', key);
        signalingRef.current?.sendSignal({
          type: 'offer',
          fromUserId: meId,
          toUserId: key, // 서버에서 숫자로 사용
          sdp: offer,
        });
      } catch (e) {
        console.warn('[rtc] onnegotiationneeded error', e);
      }
=======
    // 원격 스트림 수신
    pc.ontrack = (e) => {
      setRemoteStreams((prev) => ({ ...prev, [key]: e.streams[0] }));
    };

    // 내 ICE 후보 송신
    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      console.log('[SIG->] ice', { to: 'mesh/room-broadcast', cand: e.candidate?.candidate?.slice(0, 40) });
      signalingRef.current?.sendSignal({
        type: 'ice',
        fromUserId: meId,
        // mesh 브로드캐스트일 경우 toUserId 생략 가능. 특정 타깃이면 원본 id를 별도 보관해 사용.
        candidate: e.candidate.toJSON(),
      });
>>>>>>> 7b9b1ce (브랜치 최신화)
    };

    pc.ontrack = (e: RTCTrackEvent) => {
      const dk = displayKey(key);
      dlog('[rtc] ontrack from', key, '->', dk);
      const stream = e.streams[0];
      if (stream) {
        setRemoteStreams(prev => ({ ...prev, [dk]: stream }));
      }
    };

    pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (!e.candidate) return;
      const typ = e.candidate.candidate.match(/typ (\w+)/)?.[1];
      dlog('[rtc] ICE ->', key, 'typ=', typ);
      signalingRef.current?.sendSignal({
        type: 'ice',
        fromUserId: meId,
        toUserId: key,
        candidate: e.candidate.toJSON(),
      });
    };

    pc.oniceconnectionstatechange = () => {
      dlog('[rtc] iceState[%s]=%s', key, pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
<<<<<<< HEAD
      dlog('[rtc] connState[%s]=%s', key, pc.connectionState);
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        setPeers(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[displayKey(key)];
          return next;
        });
=======
      const st = pc.connectionState;
      if (st === 'failed' || st === 'closed' || st === 'disconnected') {
        setPeers((prev) => { const { [key]: _, ...rest } = prev; return rest; });
        setRemoteStreams((prev) => { const { [key]: __, ...rest } = prev; return rest; });
>>>>>>> 7b9b1ce (브랜치 최신화)
        pc.close();
      }
    };

<<<<<<< HEAD
    setPeers(prev => ({ ...prev, [key]: pc }));
=======
    setPeers((prev) => ({ ...prev, [key]: pc }));
>>>>>>> 7b9b1ce (브랜치 최신화)
    return pc;
  }, [rtcConfig, localStream, meId]);

  useEffect(() => {
    dlog('[rtc] mount room=%s me=%s', roomId, meId);

    const onSignal = async (signal: WebRTCSignal) => {
      const { type, fromUserId, sdp, candidate } = signal;
      const k = sigKey(fromUserId);
      dlog('[sig] <=', type, 'from', fromUserId, 'key', k);

      let pc = peersRef.current[k];
      if (!pc) pc = createPeerConnection(k);

      if (type === 'offer' && sdp) {
        // glare 방지: id 큰 쪽이 polite
        const polite = idNum(meId) > idNum(k);
        const offerCollision = pc.signalingState !== 'stable';
        if (!polite && offerCollision) {
          dlog('[rtc] glare: ignore foreign offer (impolite)');
          return;
        }

        await pc.setRemoteDescription(sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        dlog('[rtc] -> send ANSWER to', k);
        signalingRef.current?.sendSignal({
          type: 'answer',
          fromUserId: meId,
          toUserId: String(fromUserId),
          sdp: answer,
        });

<<<<<<< HEAD
        // 큐 적용
        const queued = pendingIceMap.current[k] || [];
        for (const c of queued) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
          catch (e) { console.warn('[rtc] addIceCandidate(queued) error:', e, c); }
        }
        pendingIceMap.current[k] = [];
      } else if (type === 'answer' && sdp) {
        await pc.setRemoteDescription(sdp);
        const queued = pendingIceMap.current[k] || [];
        for (const c of queued) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
          catch (e) { console.warn('[rtc] addIceCandidate(queued) error:', e, c); }
        }
        pendingIceMap.current[k] = [];
      } else if (type === 'ice' && candidate) {
        const typ = candidate.candidate?.match?.(/typ (\w+)/)?.[1];
        dlog('[rtc] ICE <=', k, 'typ=', typ);
        if (pc.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
          catch (e) { console.warn('[rtc] addIceCandidate error:', e, candidate); }
        } else {
          (pendingIceMap.current[k] ||= []).push(candidate);
        }
      }
    };

    const client = new SignalingClient(roomId, meId, onSignal, () => {
      dlog('[rtc] signaling ready');
    });
    signalingRef.current = client;

    return () => {
      client.disconnect();
      signalingRef.current = null;
      setPeers(prev => {
        Object.values(prev).forEach(pc => pc.close());
        return {};
      });
      setRemoteStreams({});
      pendingIceMap.current = {};
      dlog('[rtc] unmount');
    };
  }, [roomId, meId, createPeerConnection]);

  // 로컬 트랙 변경 동기화
  useEffect(() => {
    if (!localStream) return;
    Object.values(peersRef.current).forEach(pc => {
      try { syncLocalTracksToPc(pc, localStream); }
      catch (e) { console.warn('[rtc] syncLocalTracksToPc failed:', e); }
    });
  }, [localStream, audioTrackId, videoTrackId]);

  // 수동 발신(초기 트리거)
  const callUser = useCallback(async (targetUserId: string) => {
    const k = sigKey(targetUserId);
    const pc = createPeerConnection(k);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    dlog('[rtc] manual -> OFFER to', k);
=======
  // 상대에게 오퍼 발신
  async function callUser(targetUserId: string) {
    const key = sigKey(targetUserId);
    const pc = createPeerConnection(key);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log('[SIG->] offer', { to: targetUserId });
>>>>>>> 7b9b1ce (브랜치 최신화)
    signalingRef.current?.sendSignal({
      type: 'offer',
      fromUserId: meId,
      toUserId: targetUserId, // 서버에는 원본 id 전달
      sdp: offer,
    });
  }, [createPeerConnection, meId]);

  return { peers, remoteStreams, callUser };
}
