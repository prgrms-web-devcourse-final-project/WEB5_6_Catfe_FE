// src/hook/useMediaStream.ts
import { useCallback, useRef, useState } from 'react';

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream|null>(null);
  const startedRef = useRef(false);

  const initMedia = useCallback(async () => {
    if (startedRef.current) return localStream; 
    startedRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('❌ 카메라/마이크 접근 실패:', err);
      startedRef.current = false;
      return null;
    }
  }, [localStream]);

  return { localStream, initMedia };
}
