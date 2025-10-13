'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WebRTCSignal } from '@/lib/types';
import SignalingClient from '@/lib/signalingClient';

/** ---------- helpers ---------- */
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

type GetDisplayMedia = (c?: DisplayMediaStreamConstraints) => Promise<MediaStream>;
function getDisplayStream(constraints: DisplayMediaStreamConstraints): Promise<MediaStream> {
  const md = navigator.mediaDevices;
  const fn = (md.getDisplayMedia as GetDisplayMedia | undefined)
          ?? (navigator.getDisplayMedia as GetDisplayMedia | undefined);
  if (!fn) return Promise.reject(new Error('getDisplayMedia is not supported by this browser'));
  return fn(constraints);
}

/** ---------- types ---------- */
type PeerConnections = Record<string, RTCPeerConnection>;
type RemoteStreams  = Record<string, MediaStream>;
type Senders        = { audio?: RTCRtpSender; video?: RTCRtpSender };

export function useWebRTC(params: {
  roomId: string;
  meId: string;
  localStream: MediaStream | null;
  rtcConfig: RTCConfiguration;
  onShareToggle?: (shareOn: boolean) => void;
  onMediaState?: (s: { micOn?: boolean; camOn?: boolean; shareOn?: boolean }) => void;
}) {
  const { roomId, meId, localStream, rtcConfig, onShareToggle, onMediaState } = params;

  const [peers, setPeers]                   = useState<PeerConnections>({});
  const [remoteStreams, setRemoteStreams]   = useState<RemoteStreams>({});
  const [signalingReady, setSignalingReady] = useState(false);

  const peersRef = useRef<PeerConnections>({});
  useEffect(() => { peersRef.current = peers; }, [peers]);

  const sendersRef       = useRef<Record<string, Senders>>({});
  const pendingIceMap    = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const signalingRef     = useRef<SignalingClient | null>(null);
  const hasOfferedRef    = useRef<Record<string, boolean>>({});
  const disconnectTimers = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});

  // 로컬 상태
  const [micOn, setMicOn]         = useState(true);
  const [camOn, setCamOn]         = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const shareStreamRef = useRef<MediaStream | null>(null);
  const [localPreviewStream, setLocalPreviewStream] = useState<MediaStream | null>(null);

  const audioTrackId = useMemo(() => localStream?.getAudioTracks?.()[0]?.id ?? '', [localStream]);
  const videoTrackId = useMemo(() => localStream?.getVideoTracks?.()[0]?.id ?? '', [localStream]);

  /** 단일 피어 정리 */
  const cleanupPeer = useCallback((key: string) => {
    setPeers(prev => { const n = { ...prev }; delete n[key]; return n; });
    setRemoteStreams(prev => { const n = { ...prev }; delete n[displayKey(key)]; return n; });
    try { sendersRef.current[key]?.audio?.replaceTrack(null); } catch {}
    try { sendersRef.current[key]?.video?.replaceTrack(null); } catch {}
    delete sendersRef.current[key];
    delete pendingIceMap.current[key];
    delete hasOfferedRef.current[key];
    const t = disconnectTimers.current[key]; if (t) clearTimeout(t);
    delete disconnectTimers.current[key];
  }, []);

  /** RTCPeerConnection 생성 */
  const createPeerConnection = useCallback((key: string): RTCPeerConnection => {
    const exist = peersRef.current[key]; if (exist) return exist;

    const pc = new RTCPeerConnection(rtcConfig);
    const aTrans = pc.addTransceiver('audio', { direction: 'sendrecv' });
    const vTrans = pc.addTransceiver('video', { direction: 'sendrecv' });
    sendersRef.current[key] = { audio: aTrans.sender, video: vTrans.sender };

    // 초기 트랙 부착
    const s = sendersRef.current[key];
    const a = localStream?.getAudioTracks?.()[0] ?? null;
    const v = (isSharing
      ? shareStreamRef.current?.getVideoTracks?.()[0]
      : localStream?.getVideoTracks?.()[0]) ?? null;

    if (a) { a.enabled = micOn; void s.audio?.replaceTrack(a); }
    if (v) { v.enabled = camOn || isSharing; void s.video?.replaceTrack(v); }

    pc.ontrack = (e: RTCTrackEvent) => {
      const stream = e.streams[0]; if (!stream) return;
      setRemoteStreams(prev => ({ ...prev, [displayKey(key)]: stream }));
    };
    pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (!e.candidate) return;
      signalingRef.current?.sendSignal({
        type: 'ice',
        fromUserId: meId,
        toUserId: key,
        candidate: e.candidate.toJSON(),
      });
    };
    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === 'disconnected') {
        const prev = disconnectTimers.current[key]; if (prev) clearTimeout(prev);
        disconnectTimers.current[key] = setTimeout(() => {
          if (pc.connectionState === 'disconnected') { try { pc.close(); } catch {} cleanupPeer(key); }
        }, 3000);
      } else if (st === 'failed' || st === 'closed') {
        const t = disconnectTimers.current[key]; if (t) clearTimeout(t);
        try { pc.close(); } catch {} cleanupPeer(key);
      }
    };

    setPeers(prev => ({ ...prev, [key]: pc }));
    return pc;
  }, [rtcConfig, localStream, meId, cleanupPeer, isSharing, micOn, camOn]);

  /** 시그널 처리 */
  const onSignalRef = useRef<(s: WebRTCSignal) => void>(() => {});
  onSignalRef.current = async (signal: WebRTCSignal) => {
    const { type, fromUserId, sdp, candidate } = signal;
    const k = sigKey(fromUserId);
    let pc = peersRef.current[k]; if (!pc) pc = createPeerConnection(k);

    if (type === 'offer' && sdp) {
      const polite = idNum(meId) > idNum(k);
      const glare  = pc.signalingState !== 'stable';
      try {
        if (glare) {
          if (!polite) return;
          await pc.setLocalDescription({ type: 'rollback' } as RTCLocalSessionDescriptionInit);
        }
        await pc.setRemoteDescription(sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signalingRef.current?.sendSignal({ type: 'answer', fromUserId: meId, toUserId: String(fromUserId), sdp: answer });
        for (const c of (pendingIceMap.current[k] || [])) { try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {} }
        pendingIceMap.current[k] = [];
      } catch (e) { console.warn('[rtc] handle OFFER error', e); }
    } else if (type === 'answer' && sdp) {
      try {
        await pc.setRemoteDescription(sdp);
        for (const c of (pendingIceMap.current[k] || [])) { try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {} }
        pendingIceMap.current[k] = [];
      } catch (e) { console.warn('[rtc] handle ANSWER error', e); }
    } else if (type === 'ice' && candidate) {
      if (pc.remoteDescription) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { console.warn(e); }
      } else {
        (pendingIceMap.current[k] ||= []).push(candidate);
      }
    }
  };

  /** 시그널링 lifecycle */
  useEffect(() => {
    const client = new SignalingClient(
      roomId,
      meId,
      (s) => onSignalRef.current(s),
      () => setSignalingReady(true),
      (uid, state) => dlog('media-state <=', uid, state),
    );
    signalingRef.current = client;

    return () => {
      setSignalingReady(false);
      client.disconnect();
      signalingRef.current = null;

      setPeers(prev => { Object.values(prev).forEach(pc => { try { pc.close(); } catch {} }); return {}; });
      setRemoteStreams({});
      pendingIceMap.current = {};
      sendersRef.current = {};
      hasOfferedRef.current = {};
      Object.values(disconnectTimers.current).forEach(t => t && clearTimeout(t));
      disconnectTimers.current = {};
      dlog('unmount');
    };
  }, [roomId, meId]);

  /** 로컬 기본 트랙 -> 모든 sender 반영 + 프리뷰 구성 */
  useEffect(() => {
    if (!localStream) { setLocalPreviewStream(null); return; }

    const a = localStream.getAudioTracks?.()[0] ?? null;
    const v = localStream.getVideoTracks?.()[0] ?? null;
    if (a) setMicOn(a.enabled);
    if (v && !isSharing) setCamOn(v.enabled);

    if (!isSharing) {
      setLocalPreviewStream(new MediaStream([...(a ? [a] : []), ...(v ? [v] : [])]));
    }

    Object.values(sendersRef.current).forEach((s) => {
      try {
        if (a) { a.enabled = micOn; void s.audio?.replaceTrack(a); }
        if (!isSharing && v) { v.enabled = camOn; void s.video?.replaceTrack(v); }
      } catch (e) { console.warn('[rtc] replaceTrack failed:', e); }
    });
  }, [localStream, audioTrackId, videoTrackId, isSharing]);

  /** 화면 공유 시작/종료 */
  const startScreenShare = useCallback(async () => {
    if (isSharing) return;
    try {
      const display = await getDisplayStream({ video: true, audio: false });
      shareStreamRef.current = display;
      const v = display.getVideoTracks?.()[0];
      if (!v) throw new Error('no display video track');

      for (const s of Object.values(sendersRef.current)) {
        try { await s.video?.replaceTrack(v); } catch (e) { console.warn('[rtc] replaceTrack(display) failed:', e); }
      }

      const a = localStream?.getAudioTracks?.()[0] ?? null;
      setLocalPreviewStream(new MediaStream([...(a ? [a] : []), v]));

      setIsSharing(true);
      onShareToggle?.(true);
      onMediaState?.({ shareOn: true });

      v.addEventListener('ended', () => { void stopScreenShare(); });
    } catch (e) {
      console.warn('[rtc] startScreenShare error:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSharing, localStream]);

  const stopScreenShare = useCallback(async () => {
    if (!isSharing) return;
    const disp = shareStreamRef.current;
    shareStreamRef.current = null;

    const v = localStream?.getVideoTracks?.()[0] ?? null;
    for (const s of Object.values(sendersRef.current)) {
      try { await s.video?.replaceTrack(v ?? null); } catch (e) { console.warn('[rtc] replaceTrack(camera) failed:', e); }
    }

    const a = localStream?.getAudioTracks?.()[0] ?? null;
    setLocalPreviewStream(new MediaStream([...(a ? [a] : []), ...(v ? [v] : [])]));

    try { disp?.getTracks?.().forEach(t => t.stop()); } catch {}

    setIsSharing(false);
    onShareToggle?.(false);
    onMediaState?.({ shareOn: false });
  }, [isSharing, localStream, onShareToggle, onMediaState]);

  /** 마이크/카메라 토글 */
  const toggleMic = useCallback(() => {
    const a = localStream?.getAudioTracks?.()[0] ?? null;
    if (!a) return;
    a.enabled = !a.enabled;
    setMicOn(a.enabled);
    onMediaState?.({ micOn: a.enabled });
  }, [localStream, onMediaState]);

  const toggleCam = useCallback(async () => {
    if (isSharing) return;
    const v = localStream?.getVideoTracks?.()[0] ?? null;
    if (!v) return;
    v.enabled = !v.enabled;
    setCamOn(v.enabled);
    onMediaState?.({ camOn: v.enabled });
    for (const s of Object.values(sendersRef.current)) {
      try { await s.video?.replaceTrack(v); } catch {}
    }
  }, [localStream, isSharing, onMediaState]);

  /** 수동 OFFER 발신 */
  const callUser = useCallback(async (targetUserId: string) => {
    if (!targetUserId) return;
    const k = sigKey(targetUserId);
    if (!signalingReady || hasOfferedRef.current[k]) return;

    const pc = createPeerConnection(k);

    const s = sendersRef.current[k];
    const a = localStream?.getAudioTracks?.()[0] ?? null;
    const v = (isSharing
      ? shareStreamRef.current?.getVideoTracks?.()[0]
      : localStream?.getVideoTracks?.()[0]) ?? null;

    if (a && !s?.audio?.track) { a.enabled = micOn; await s?.audio?.replaceTrack(a); }
    if (v && !s?.video?.track) { v.enabled = camOn || isSharing; await s?.video?.replaceTrack(v); }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    hasOfferedRef.current[k] = true;

    signalingRef.current?.sendSignal({ type: 'offer', fromUserId: meId, toUserId: targetUserId, sdp: offer });
  }, [createPeerConnection, meId, localStream, signalingReady, isSharing, micOn, camOn]);

  return {
    peers,
    remoteStreams,
    signalingReady,
    callUser,

    micOn, camOn, isSharing,
    toggleMic, toggleCam,
    startScreenShare, stopScreenShare,

    localPreviewStream,
  };
}
