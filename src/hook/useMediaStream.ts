// src/hook/useMediaStream.ts
import { useState } from 'react';

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("❌ 카메라/마이크 접근 실패:", err);
      return null;
    }
  };

  return { localStream, initMedia };
}
