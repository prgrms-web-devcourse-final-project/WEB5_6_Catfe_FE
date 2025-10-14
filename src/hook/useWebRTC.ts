'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WebRTCSignal } from '@/lib/types';
import SignalingClient from '@/lib/signalingClient';

const DEBUG = process.env.NODE_ENV !== 'production';
const dlog = (...a: unknown[]) => { if (DEBUG) console.log('[rtc]', ...a); };
const sigKey = (id: string | number) => {
  const s = String(id); const p = s.split('-')[1] ?? s; const n = Number(p);
  return Number.isFinite(n) ? String(n) : s;
};
const displayKey = (k: string) => (k.startsWith('u-') ? k : `u-${k}`);
const idNum = (id: string | number) => {
  const s = String(id); const p = s.split('-')[1] ?? s; const n = Number(p);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
};

function getDisplayStream(constraints: DisplayMediaStreamConstraints): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    return Promise.reject(new Error('getDisplayMedia is not supported by this browser'));
  }
  // "Illegal invocation" 오류를 방지하기 위해 항상 navigator.mediaDevices를 통해 호출합니다.
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

  useEffect(() => { rtcConfigRef.current = rtcConfig; }, [rtcConfig]);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const shareStreamRef = useRef<MediaStream | null>(null);
  const [localPreviewStream, setLocalPreviewStream] = useState<MediaStream | null>(null);
  const [activeVideoTrack, setActiveVideoTrack] = useState<MediaStreamTrack | null>(null);

  const cleanupPeer = useCallback((key: string) => {
    dlog(`[cleanup] peer: ${key}`);
    const pc = peersRef.current[key];
    if (pc) {
      pc.ontrack = null; pc.onicecandidate = null; pc.onconnectionstatechange = null; pc.onnegotiationneeded = null;
      try { pc.close(); } catch {}
      delete peersRef.current[key];
    }
    setRemoteStreams(prev => {
      const newState = { ...prev };
      delete newState[displayKey(key)];
      return newState;
    });
  }, []);

  const createPeerConnection = useCallback((key: string) => {
    if (peersRef.current[key]) return peersRef.current[key];
    dlog(`[pc] Creating new peer connection for ${key}`);
    const pc = new RTCPeerConnection(rtcConfigRef.current);
    peersRef.current[key] = pc;

    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) pc.addTrack(audioTrack, localStream!);
    if (activeVideoTrack) pc.addTrack(activeVideoTrack, localStream!);

    pc.onnegotiationneeded = async () => {
      dlog(`[negotiation] needed for ${key}`);
      try {
        if (idNum(meId) < idNum(key)) {
          dlog(`[negotiation] I am impolite, creating offer for ${key}`);
          await pc.setLocalDescription(await pc.createOffer());
          if (pc.localDescription) {
            signalingClient?.sendSignal({ type: 'offer', fromUserId: meId, toUserId: key, sdp: pc.localDescription.toJSON() });
          }
        }
      } catch (err) { console.error(`[negotiation] createOffer failed for ${key}:`, err); }
    };
    pc.ontrack = (e: RTCTrackEvent) => {
      dlog(`[track] received from ${key}`, e.streams[0]);
      setRemoteStreams(prev => ({ ...prev, [displayKey(key)]: e.streams[0] }));
    };
    pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate) {
        signalingClient?.sendSignal({ type: 'ice', fromUserId: meId, toUserId: key, candidate: e.candidate.toJSON() });
      }
    };
    pc.onconnectionstatechange = () => {
      dlog(`[state] for ${key} is now ${pc.connectionState}`);
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        cleanupPeer(key);
      }
    };
    return pc;
  }, [meId, localStream, signalingClient, cleanupPeer, activeVideoTrack]);

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
            signalingClient.sendSignal({ type: 'answer', fromUserId: meId, toUserId: String(fromUserId), sdp: pc.localDescription.toJSON() });
          }
        } else if (type === 'answer' && sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        } else if (type === 'ice' && candidate) {
          await pc.addIceCandidate(candidate);
        }
      } catch (e) { console.error(`[signal] Error handling ${type} from ${k}:`, e); }
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
    const tracks = [];
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
    } catch (err) {
      console.error("Screen share failed:", err);
      stopScreenShare();
    }
  }, [isSharing, signalingClient, stopScreenShare]);

  const toggleMic = useCallback(() => {
    const enabled = !micOn;
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = enabled;
    signalingClient?.sendMediaToggle('AUDIO', enabled);
    setMicOn(enabled);
    dlog('Mic toggled to', enabled);
  }, [micOn, localStream, signalingClient]);

  const toggleCam = useCallback(() => {
    if (isSharing) return;
    const enabled = !camOn;
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = enabled;
    signalingClient?.sendMediaToggle('VIDEO', enabled);
    setCamOn(enabled);
    dlog('Cam toggled to', enabled);
  }, [camOn, isSharing, localStream, signalingClient]);

  const callUser = useCallback((targetUserId: string) => {
    if (!targetUserId || !signalingReady) return;
    createPeerConnection(sigKey(targetUserId));
  }, [createPeerConnection, signalingReady]);

  return {
    peers: peersRef.current, remoteStreams, signalingReady, callUser,
    micOn, camOn, isSharing,
    toggleMic, toggleCam, startScreenShare, stopScreenShare,
    localPreviewStream,
  };
}
