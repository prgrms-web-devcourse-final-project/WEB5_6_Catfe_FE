'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WebRTCSignal } from '@/lib/types';
import SignalingClient from '@/lib/signalingClient';

const sigKey = (id: string | number) => {
  const s = String(id);
  const p = s.split('-')[1] ?? s;
  const n = Number(p);
  return Number.isFinite(n) ? String(n) : s;
};
const displayKey = (k: string) => (k.startsWith('u-') ? k : `u-${k}`);
const idNum = (id: string | number) => {
  const s = String(id);
  const p = s.split('-')[1] ?? s;
  const n = Number(p);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
};

function getDisplayStream(constraints: DisplayMediaStreamConstraints): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    return Promise.reject(new Error('getDisplayMedia is not supported by this browser'));
  }
  return navigator.mediaDevices.getDisplayMedia(constraints);
}

type PeerConnections = Record<string, RTCPeerConnection>;
type RemoteStreams = Record<string, MediaStream>;

export function useWebRTC(params: {
  roomId: string;
  meId: string;
  localStream: MediaStream | null;
  rtcConfig: RTCConfiguration;
  signalingClient: SignalingClient | null;
  peerIds: string[];
}) {
  const { meId, localStream, rtcConfig, signalingClient, peerIds } = params;

  const peersRef = useRef<PeerConnections>({});
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreams>({});
  const [signalingReady, setSignalingReady] = useState(false);
  const rtcConfigRef = useRef(rtcConfig);

  useEffect(() => {
    rtcConfigRef.current = rtcConfig;
  }, [rtcConfig]);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const shareStreamRef = useRef<MediaStream | null>(null);
  const [localPreviewStream, setLocalPreviewStream] = useState<MediaStream | null>(null);
  const [activeVideoTrack, setActiveVideoTrack] = useState<MediaStreamTrack | null>(null);

  const cleanupPeer = useCallback((key: string) => {
    const pc = peersRef.current[key];
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onconnectionstatechange = null;
      pc.onnegotiationneeded = null;
      try {
        pc.close();
      } catch {}
      delete peersRef.current[key];
    }
    setRemoteStreams(prev => {
      const next = { ...prev };
      delete next[displayKey(key)];
      return next;
    });
  }, []);

  const createPeerConnection = useCallback(
    (key: string) => {
      if (peersRef.current[key]) return peersRef.current[key];
      const pc = new RTCPeerConnection(rtcConfigRef.current);
      peersRef.current[key] = pc;

      const audioTrack = localStream?.getAudioTracks()[0];
      if (audioTrack) pc.addTrack(audioTrack, localStream!);
      if (activeVideoTrack) pc.addTrack(activeVideoTrack, localStream!);

      pc.onnegotiationneeded = async () => {
        try {
          if (idNum(meId) < idNum(key)) {
            await pc.setLocalDescription(await pc.createOffer());
            if (pc.localDescription) {
              signalingClient?.sendSignal({
                type: 'offer',
                fromUserId: meId,
                toUserId: key,
                sdp: pc.localDescription.toJSON(),
              });
            }
          }
        } catch {}
      };
      pc.ontrack = (e: RTCTrackEvent) => {
        setRemoteStreams(prev => ({ ...prev, [displayKey(key)]: e.streams[0] }));
      };
      pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
        if (e.candidate) {
          signalingClient?.sendSignal({
            type: 'ice',
            fromUserId: meId,
            toUserId: key,
            candidate: e.candidate.toJSON(),
          });
        }
      };
      pc.onconnectionstatechange = () => {
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
          cleanupPeer(key);
        }
      };
      return pc;
    },
    [meId, localStream, signalingClient, cleanupPeer, activeVideoTrack],
  );

  useEffect(() => {
    if (!signalingClient) return;
    setSignalingReady(signalingClient.isReady);
    const handleSignal = async (signal: WebRTCSignal) => {
      const { type, fromUserId, sdp, candidate } = signal;
      if (!fromUserId) return;
      const k = sigKey(fromUserId);
      const pc = peersRef.current[k] || createPeerConnection(k);
      try {
        if (type === 'offer' && sdp) {
          const isPolite = idNum(meId) > idNum(k);
          const glare = pc.signalingState !== 'stable';
          if (glare && !isPolite) return;
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await pc.setLocalDescription(await pc.createAnswer());
          if (pc.localDescription) {
            signalingClient.sendSignal({
              type: 'answer',
              fromUserId: meId,
              toUserId: String(fromUserId),
              sdp: pc.localDescription.toJSON(),
            });
          }
        } else if (type === 'answer' && sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        } else if (type === 'ice' && candidate) {
          await pc.addIceCandidate(candidate);
        }
      } catch {}
    };
    signalingClient.addSignalListener(handleSignal);
    return () => {
      signalingClient.removeSignalListener(handleSignal);
      Object.keys(peersRef.current).forEach(cleanupPeer);
    };
  }, [signalingClient, meId, createPeerConnection, cleanupPeer]);

  useEffect(() => {
    if (!activeVideoTrack) return;
    for (const peer of Object.values(peersRef.current)) {
      const sender = peer.getSenders().find(s => s.track?.kind === 'video');
      sender?.replaceTrack(activeVideoTrack);
    }
  }, [activeVideoTrack]);

  useEffect(() => {
    if (localStream && !activeVideoTrack) {
      setActiveVideoTrack(localStream.getVideoTracks()[0] ?? null);
    }
  }, [localStream, activeVideoTrack]);

  useEffect(() => {
    const audioTrack = localStream?.getAudioTracks()[0];
    const tracks: MediaStreamTrack[] = [];
    if (audioTrack) {
      audioTrack.enabled = micOn;
      tracks.push(audioTrack);
    }
    if (activeVideoTrack) {
      activeVideoTrack.enabled = isSharing ? true : camOn;
      tracks.push(activeVideoTrack);
    }
    setLocalPreviewStream(new MediaStream(tracks));
  }, [localStream, activeVideoTrack, micOn, camOn, isSharing]);

  useEffect(() => {
    if (!localStream || !signalingReady) return;
    const currentPeerKeys = new Set(Object.keys(peersRef.current));
    const newPeerKeys = new Set(peerIds.filter(id => sigKey(id) !== meId).map(sigKey));
    for (const key of newPeerKeys) if (!currentPeerKeys.has(key)) createPeerConnection(key);
    for (const key of currentPeerKeys) if (!newPeerKeys.has(key)) cleanupPeer(key);
  }, [peerIds, localStream, meId, signalingReady, createPeerConnection, cleanupPeer]);

  const stopScreenShare = useCallback(() => {
    if (!isSharing) return;
    const cameraTrack = localStream?.getVideoTracks()[0] ?? null;
    setActiveVideoTrack(cameraTrack);
    shareStreamRef.current?.getTracks().forEach(track => track.stop());
    shareStreamRef.current = null;
    setIsSharing(false);
    setCamOn(true);
    signalingClient?.sendMediaToggle('SCREEN', false);
  }, [isSharing, localStream, signalingClient]);

  const startScreenShare = useCallback(async () => {
    if (isSharing) return;
    try {
      const displayStream = await getDisplayStream({ video: true });
      const screenTrack = displayStream.getVideoTracks()[0];
      if (screenTrack) {
        shareStreamRef.current = displayStream;
        setActiveVideoTrack(screenTrack);
        setIsSharing(true);
        signalingClient?.sendMediaToggle('SCREEN', true);
        screenTrack.onended = () => stopScreenShare();
      }
    } catch {
      stopScreenShare();
    }
  }, [isSharing, signalingClient, stopScreenShare]);

  const toggleMic = useCallback(() => {
    const enabled = !micOn;
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = enabled;
    signalingClient?.sendMediaToggle('AUDIO', enabled);
    setMicOn(enabled);
  }, [micOn, localStream, signalingClient]);

  const toggleCam = useCallback(() => {
    if (isSharing) return;
    const enabled = !camOn;
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = enabled;
    signalingClient?.sendMediaToggle('VIDEO', enabled);
    setCamOn(enabled);
  }, [camOn, isSharing, localStream, signalingClient]);

  const callUser = useCallback(
    (targetUserId: string) => {
      if (!targetUserId || !signalingReady) return;
      createPeerConnection(sigKey(targetUserId));
    },
    [createPeerConnection, signalingReady],
  );

  return {
    peers: peersRef.current,
    remoteStreams,
    signalingReady,
    callUser,
    micOn,
    camOn,
    isSharing,
    toggleMic,
    toggleCam,
    startScreenShare,
    stopScreenShare,
    localPreviewStream,
  };
}
