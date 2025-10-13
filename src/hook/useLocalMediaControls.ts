"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 외부(시그널링)로 내 상태를 뿌리고 싶을 때 사용하는 콜백 타입 */
export type EmitMediaState = (s: LocalMediaState) => void;

export type LocalMediaState = {
  micOn: boolean;
  camOn: boolean;
  shareOn: boolean;
};

function toTrackMap(stream: MediaStream | null) {
  return {
    audio: stream?.getAudioTracks?.()[0] ?? null,
    video: stream?.getVideoTracks?.()[0] ?? null,
  };
}

export function useLocalMediaControls(emitMediaState?: EmitMediaState) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<LocalMediaState>({
    micOn: false,
    camOn: false,
    shareOn: false,
  });
  const sharingTrackRef = useRef<MediaStreamTrack | null>(null);

  /** setState와 브로드캐스트를 한 번에 */
  const syncState = useCallback(
    (next: Partial<LocalMediaState>) => {
      setState((prev) => {
        const merged: LocalMediaState = { ...prev, ...next };
        try {
          emitMediaState?.(merged); 
        } catch {}
        return merged;
      });
    },
    [emitMediaState]
  );

  // 최초 획득
  const init = useCallback(async () => {
    if (stream) return stream;
    try {
      console.log("[media] getUserMedia...");
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log(
        "[media] OK:",
        s.getTracks().map((t) => `${t.kind}:${t.readyState} enabled=${t.enabled}`)
      );
      setStream(new MediaStream(s.getTracks()));
      syncState({
        micOn: !!s.getAudioTracks()[0]?.enabled,
        camOn: !!s.getVideoTracks()[0]?.enabled,
        shareOn: false,
      });
      return s;
    } catch (e) {
      console.error("❌ getUserMedia 실패:", e);
      throw e;
    }
  }, [stream, syncState]);

  // 마이크 토글
  const toggleMic = useCallback(async () => {
    if (!stream) await init();
    const { audio } = toTrackMap(stream);
    if (audio) {
      audio.enabled = !audio.enabled;
      syncState({ micOn: audio.enabled });
      console.log("[media] mic ->", audio.enabled ? "ON" : "OFF");
      return;
    }
    // 오디오 트랙이 없으면 획득해서 추가
    try {
      const a = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = a.getAudioTracks()[0];
      if (!track) return;
      const next = new MediaStream([...(stream?.getVideoTracks() ?? []), track]);
      setStream(next);
      syncState({ micOn: true });
      console.log("[media] mic track added");
    } catch (e) {
      console.error("❌ add audio track 실패:", e);
    }
  }, [stream, init, syncState]);

  // 카메라 토글
  const toggleCam = useCallback(async () => {
    if (!stream) await init();
    const { video } = toTrackMap(stream);
    if (video) {
      video.enabled = !video.enabled;
      syncState({ camOn: video.enabled });
      console.log("[media] cam ->", video.enabled ? "ON" : "OFF");
      return;
    }
    try {
      const v = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = v.getVideoTracks()[0];
      if (!track) return;
      const next = new MediaStream([track, ...(stream?.getAudioTracks() ?? [])]);
      setStream(next);
      syncState({ camOn: true });
      console.log("[media] cam track added");
    } catch (e) {
      console.error("❌ add video track 실패:", e);
    }
  }, [stream, init, syncState]);

  // 화면공유 시작
  const startShare = useCallback(async () => {
    if (state.shareOn) return;
    try {
      const ds = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const shareTrack = ds.getVideoTracks()[0];
      if (!shareTrack) return;

      sharingTrackRef.current = shareTrack;

      shareTrack.onended = async () => {
        if (!sharingTrackRef.current) return;
        sharingTrackRef.current = null;
        console.log("[share] ended -> revert to camera");
        try {
          const cam = await navigator.mediaDevices.getUserMedia({ video: true });
          const camTrack = cam.getVideoTracks()[0];
          const audio = stream?.getAudioTracks() ?? [];
          const next = new MediaStream([camTrack, ...audio]);
          setStream(next);
          syncState({ shareOn: false, camOn: true });
        } catch (e) {
          console.warn("❕ camera restore 실패:", e);
          const audio = stream?.getAudioTracks() ?? [];
          setStream(new MediaStream([...audio]));
          syncState({ shareOn: false, camOn: false });
        }
      };

      const audio = stream?.getAudioTracks() ?? [];
      const next = new MediaStream([shareTrack, ...audio]);
      setStream(next);
      syncState({ shareOn: true, camOn: false });
      console.log("[share] start");
    } catch (e) {
      console.error("❌ getDisplayMedia 실패:", e);
    }
  }, [state.shareOn, stream, syncState]);

  // 화면공유 중지(수동)
  const stopShare = useCallback(async () => {
    if (!state.shareOn) return;
    sharingTrackRef.current?.stop();
    // onended 핸들러에서 cam 복구 syncState 처리됨
  }, [state.shareOn]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  return {
    stream,
    state,
    init,
    toggleMic,
    toggleCam,
    startShare,
    stopShare,
  };
}
