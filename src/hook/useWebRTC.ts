// src/hook/useWebRTC.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import type { WebRTCSignal, PeerConnections, RemoteStreams } from '@/lib/types';
import SignalingClient from '@/lib/signalingClient';

export function useWebRTC(params: {
  roomId: string;
  meId: string;
  localStream: MediaStream | null;
  rtcConfig: RTCConfiguration;
}) {
  const { roomId, meId, localStream, rtcConfig } = params;

  const [peers, setPeers] = useState<PeerConnections>({});
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreams>({});
  const signalingRef = useRef<SignalingClient | null>(null);
  const initedRef = useRef(false);

  // 항상 최신 peers를 가리키게
  const peersRef = useRef<PeerConnections>({});
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  // 🔒 ICE 후보가 remoteDescription 세팅 전 먼저 도착할 수 있으므로 큐잉
  const pendingIceMap = useRef<Record<string, RTCIceCandidateInit[]>>({});

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const onSignal = async (signal: WebRTCSignal) => {
      const { type, fromUserId, sdp, candidate } = signal;
      let pc = peersRef.current[fromUserId];
      if (!pc) pc = createPeerConnection(fromUserId);

      if (type === 'offer' && sdp) {
        // 최신 방식: sdp 그대로 전달
        await pc.setRemoteDescription(sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        signalingRef.current?.sendSignal({
          type: 'answer',
          fromUserId: meId,
          toUserId: fromUserId,
          sdp: answer,
        });

        // 🔄 대기 중이던 ICE 후보 소진
        const queued = pendingIceMap.current[fromUserId] || [];
        for (const c of queued) await pc.addIceCandidate(new RTCIceCandidate(c));
        pendingIceMap.current[fromUserId] = [];

      } else if (type === 'answer' && sdp) {
        await pc.setRemoteDescription(sdp);

        // 🔄 대기 중이던 ICE 후보 소진
        const queued = pendingIceMap.current[fromUserId] || [];
        for (const c of queued) await pc.addIceCandidate(new RTCIceCandidate(c));
        pendingIceMap.current[fromUserId] = [];

      } else if (type === 'ice' && candidate) {
        // remoteDescription 세팅 여부에 따라 즉시/큐잉
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          (pendingIceMap.current[fromUserId] ||= []).push(candidate);
        }
      }
    };

    signalingRef.current = new SignalingClient(roomId, meId, onSignal);

    return () => {
      signalingRef.current?.disconnect();
      signalingRef.current = null;

      setPeers((prev) => {
        Object.values(prev).forEach((pc) => pc.close());
        return {};
      });
      setRemoteStreams({});
      pendingIceMap.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, meId]);

  function createPeerConnection(targetUserId: string) {
    const existing = peersRef.current[targetUserId];
    if (existing) return existing;

    const pc = new RTCPeerConnection(rtcConfig);

    // 로컬 트랙 추가
    if (localStream) {
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
    }

    // 원격 스트림 수신
    pc.ontrack = (e) => {
      setRemoteStreams((prev) => ({ ...prev, [targetUserId]: e.streams[0] }));
    };

    // 내 ICE 후보 송신
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalingRef.current?.sendSignal({
          type: 'ice',
          fromUserId: meId,
          toUserId: targetUserId,
          candidate: e.candidate.toJSON(),
        });
      }
    };

    // 연결 상태 관리
    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === 'failed' || st === 'closed' || st === 'disconnected') {
        setPeers((prev) => {
          const { [targetUserId]: _, ...rest } = prev;
          return rest;
        });
        setRemoteStreams((prev) => {
          const { [targetUserId]: __, ...rest } = prev;
          return rest;
        });
        pc.close();
      }
    };

    setPeers((prev) => ({ ...prev, [targetUserId]: pc }));
    return pc;
  }

  // 로컬 스트림이 바뀌면 sender 교체/추가
  useEffect(() => {
    Object.values(peersRef.current).forEach((pc) => {
      pc.getSenders().forEach((sender) => {
        if (sender.track && localStream && !localStream.getTracks().includes(sender.track)) {
          const sameKind = localStream.getTracks().find((t) => t.kind === sender.track?.kind);
          if (sameKind) sender.replaceTrack(sameKind);
        }
      });

      if (localStream) {
        localStream.getTracks().forEach((t) => {
          const has = pc.getSenders().some((s) => s.track?.id === t.id);
          if (!has) pc.addTrack(t, localStream);
        });
      }
    });
  }, [localStream]);

  // 상대에게 오퍼 발신
  async function callUser(targetUserId: string) {
    const pc = createPeerConnection(targetUserId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signalingRef.current?.sendSignal({
      type: 'offer',
      fromUserId: meId,
      toUserId: targetUserId,
      sdp: offer,
    });
  }

  return { peers, remoteStreams, callUser };
}
