'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WebRTCSignal } from '@/lib/types';
import SignalingClient from '@/lib/signalingClient';

const DEBUG = true;
const dlog = (...a: unknown[]) => { if (DEBUG) console.log(...a); };

function sigKey(id: string | number): string {
  const s = String(id);
  const p = s.split('-')[1] ?? s;
  const n = Number(p);
  return Number.isFinite(n) ? String(n) : s;
}
function displayKey(k: string): string { return k.startsWith('u-') ? k : `u-${k}`; }
function idNum(id: string | number): number {
  const s = String(id); const p = s.split('-')[1] ?? s; const n = Number(p);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

type PeerConnections = Record<string, RTCPeerConnection>;
type RemoteStreams = Record<string, MediaStream>;

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

  const pendingIceMap = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const signalingRef = useRef<SignalingClient | null>(null);

  const audioTrackId = useMemo(() => localStream?.getAudioTracks?.()[0]?.id ?? '', [localStream]);
  const videoTrackId = useMemo(() => localStream?.getVideoTracks?.()[0]?.id ?? '', [localStream]);

  /** 트랜시버에 현재 로컬 트랙을 replaceTrack */
  function attachLocalByReplace(pc: RTCPeerConnection, stream: MediaStream | null) {
    if (!stream) return;
    const a = stream.getAudioTracks?.()[0];
    const v = stream.getVideoTracks?.()[0];

    // 고정된 audio/video 트랜시버를 찾아 치환
    const tv = pc.getTransceivers?.() ?? [];
    const tAudio = tv.find(t => t.receiver?.track?.kind === 'audio' || t.sender?.track?.kind === 'audio')
                ?? tv.find(t => t.mid === '0'); // 안전망
    const tVideo = tv.find(t => t.receiver?.track?.kind === 'video' || t.sender?.track?.kind === 'video')
                ?? tv.find(t => t.mid === '1');

    if (tAudio?.sender && a) { dlog('[rtc] replaceTrack(audio)', a.id); void tAudio.sender.replaceTrack(a); }
    if (tVideo?.sender && v) { dlog('[rtc] replaceTrack(video)', v.id); void tVideo.sender.replaceTrack(v); }
  }

  /* ---------------------- RTCPeerConnection 생성 ---------------------- */
  const createPeerConnection = useCallback((key: string): RTCPeerConnection => {
    const exist = peersRef.current[key];
    if (exist) return exist;

    const pc = new RTCPeerConnection(rtcConfig);
    dlog('[rtc] new RTCPeerConnection for', key, rtcConfig.iceServers);

    /** ✅ m-line 순서 고정: audio → video 트랜시버 선생성 */
    pc.addTransceiver('audio', { direction: 'sendrecv' });
    pc.addTransceiver('video', { direction: 'sendrecv' });

    /** 초기 로컬 트랙을 replaceTrack로만 부착 */
    attachLocalByReplace(pc, localStream);

    // 협상 중복 방지
    let negotiating = false;
    pc.onnegotiationneeded = async () => {
      if (negotiating) { dlog('[rtc] negotiation skipped (busy)'); return; }
      negotiating = true;
      try {
        dlog('[rtc] onnegotiationneeded -> createOffer');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        dlog('[rtc] send OFFER to', key);
        signalingRef.current?.sendSignal({ type: 'offer', fromUserId: meId, toUserId: key, sdp: offer });
      } catch (e) {
        console.warn('[rtc] onnegotiationneeded error', e);
      } finally {
        negotiating = false;
      }
    };

    pc.ontrack = (e: RTCTrackEvent) => {
      const dk = displayKey(key);
      const stream = e.streams[0];
      dlog('[rtc] ontrack kind=%s from=%s streams=%d', e.track.kind, key, e.streams.length);
      if (stream) setRemoteStreams(prev => ({ ...prev, [dk]: stream }));
    };

    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      const typ = e.candidate.candidate.match(/typ (\w+)/)?.[1];
      dlog('[rtc] ICE ->', key, 'typ=', typ);
      signalingRef.current?.sendSignal({
        type: 'ice', fromUserId: meId, toUserId: key, candidate: e.candidate.toJSON(),
      });
    };

    pc.oniceconnectionstatechange = () => dlog('[rtc] iceState[%s]=%s', key, pc.iceConnectionState);

    pc.onconnectionstatechange = () => {
      dlog('[rtc] connState[%s]=%s', key, pc.connectionState);
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        setPeers(prev => { const n = { ...prev }; delete n[key]; return n; });
        setRemoteStreams(prev => { const n = { ...prev }; delete n[displayKey(key)]; return n; });
        pc.close();
      }
    };

    setPeers(prev => ({ ...prev, [key]: pc }));
    return pc;
  }, [rtcConfig, localStream, meId]);

  /* --------------------------- 시그널 처리 --------------------------- */
  useEffect(() => {
    dlog('[rtc] mount room=%s me=%s (tracks: a=%s, v=%s)', roomId, meId, audioTrackId, videoTrackId);

    const onSignal = async (signal: WebRTCSignal) => {
      const { type, fromUserId, sdp, candidate } = signal;
      const k = sigKey(fromUserId);
      dlog('[sig] <=', type, 'from', fromUserId, 'key', k);

      let pc = peersRef.current[k];
      if (!pc) pc = createPeerConnection(k);

      if (type === 'offer' && sdp) {
        const polite = idNum(meId) > idNum(k);
        const offerCollision = pc.signalingState !== 'stable';
        dlog('[rtc] handle OFFER: polite=%s, signalingState=%s', polite, pc.signalingState);
        if (!polite && offerCollision) { dlog('[rtc] glare: ignore foreign offer'); return; }

        await pc.setRemoteDescription(sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        dlog('[rtc] -> send ANSWER to', k);
        signalingRef.current?.sendSignal({ type: 'answer', fromUserId: meId, toUserId: String(fromUserId), sdp: answer });

        const queued = pendingIceMap.current[k] || [];
        dlog('[rtc] apply queued ICE count=', queued.length);
        for (const c of queued) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
          catch (e) { console.warn('[rtc] addIceCandidate(queued) error:', e, c); }
        }
        pendingIceMap.current[k] = [];
      } else if (type === 'answer' && sdp) {
        dlog('[rtc] handle ANSWER from', k, 'state=', pc.signalingState);
        await pc.setRemoteDescription(sdp);
        const queued = pendingIceMap.current[k] || [];
        dlog('[rtc] apply queued ICE count=', queued.length);
        for (const c of queued) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
          catch (e) { console.warn('[rtc] addIceCandidate(queued) error:', e, c); }
        }
        pendingIceMap.current[k] = [];
      } else if (type === 'ice' && candidate) {
        const typ = candidate.candidate?.match?.(/typ (\w+)/)?.[1];
        dlog('[rtc] ICE <=', k, 'typ=', typ, 'rd=', !!pc.remoteDescription);
        if (pc.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
          catch (e) { console.warn('[rtc] addIceCandidate error:', e, candidate); }
        } else {
          (pendingIceMap.current[k] ||= []).push(candidate);
        }
      }
    };

    const client = new SignalingClient(roomId, meId, onSignal, () => dlog('[rtc] signaling ready'));
    signalingRef.current = client;

    return () => {
      client.disconnect();
      signalingRef.current = null;
      setPeers(prev => { Object.values(prev).forEach(pc => pc.close()); return {}; });
      setRemoteStreams({});
      pendingIceMap.current = {};
      dlog('[rtc] unmount');
    };
  }, [roomId, meId, createPeerConnection, audioTrackId, videoTrackId]);

  /* -------------------- 로컬 트랙 변경 시 replaceTrack -------------------- */
  useEffect(() => {
    if (!localStream) return;
    dlog('[rtc] sync local tracks -> all PCs (a=%s, v=%s)', audioTrackId, videoTrackId);
    Object.values(peersRef.current).forEach(pc => {
      try { attachLocalByReplace(pc, localStream); }
      catch (e) { console.warn('[rtc] sync replaceTrack failed:', e); }
    });
  }, [localStream, audioTrackId, videoTrackId]);

  /* ------------------------- 수동 Offer 발신 ------------------------- */
  const callUser = useCallback(async (targetUserId: string) => {
    if (!targetUserId || !localStream) { dlog('[rtc] callUser skip: no localStream'); return; }
    const k = sigKey(targetUserId);
    const pc = createPeerConnection(k);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    dlog('[rtc] manual -> send OFFER to', k);

    signalingRef.current?.sendSignal({ type: 'offer', fromUserId: meId, toUserId: targetUserId, sdp: offer });
  }, [createPeerConnection, meId, localStream]);

  return { peers, remoteStreams, callUser };
}
