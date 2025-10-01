// src/hook/useWebRTC.ts
import { useState } from 'react';
import { rtcConfig } from '@/lib/rtcConfig';
import { WebRTCSignal, PeerConnections, RemoteStreams } from '@/lib/types';
import { SignalingClient } from '@/lib/signalingClient';

export function useWebRTC(roomId: string, userId: string, accessToken: string, localStream: MediaStream | null) {
  const [peers, setPeers] = useState<PeerConnections>({});
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreams>({});

  const signaling = new SignalingClient(roomId, userId, accessToken, handleSignal);

  function createPeerConnection(targetUserId: string) {
    const pc = new RTCPeerConnection(rtcConfig);

    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({ ...prev, [targetUserId]: event.streams[0] }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signaling.sendSignal({
          type: 'ice',
          fromUserId: userId,
          toUserId: targetUserId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    setPeers((prev) => ({ ...prev, [targetUserId]: pc }));
    return pc;
  }

  async function handleSignal(signal: WebRTCSignal) {
    const { type, fromUserId, sdp, candidate } = signal;
    let pc = peers[fromUserId] || createPeerConnection(fromUserId);

    if (type === 'offer' && sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signaling.sendSignal({
        type: 'answer',
        fromUserId: userId,
        toUserId: fromUserId,
        sdp: answer,
      });
    } else if (type === 'answer' && sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    } else if (type === 'ice' && candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  async function callUser(targetUserId: string) {
    const pc = createPeerConnection(targetUserId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signaling.sendSignal({
      type: 'offer',
      fromUserId: userId,
      toUserId: targetUserId,
      sdp: offer,
    });
  }

  return { peers, remoteStreams, callUser };
}
