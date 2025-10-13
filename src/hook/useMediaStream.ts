import { useCallback, useRef, useState } from 'react';

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream|null>(null);
  const startedRef = useRef(false);

  const initMedia = useCallback(async () => {
    if (startedRef.current) return localStream;
    startedRef.current = true;

    try {
      console.log('[media] getUserMedia start');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('[media] getUserMedia OK', stream.getTracks().map(t=>`${t.kind}:${t.readyState}`));
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('[media] getUserMedia 실패:', err);
      startedRef.current = false;
      return null;
    }
  }, [localStream]);

  return { localStream, initMedia };
}
