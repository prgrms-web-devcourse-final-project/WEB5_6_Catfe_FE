'use client';

import { useEffect, useRef, useState } from "react";

export function useLocalStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let active = true;

    (async () => {
      try {
        console.log('[media] (auto) getUserMedia start');
        const s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!active) {
          s.getTracks().forEach(t => t.stop());
          return;
        }
        console.log('[media] (auto) OK', s.getTracks().map(t=>`${t.kind}:${t.readyState}`));
        setStream(s);
      } catch (e) {
        console.error('[media] (auto) getUserMedia 실패:', e);
      }
    })();

    return () => {
      active = false;
      setStream(prev => {
        prev?.getTracks().forEach(t => t.stop());
        return null;
      });
      console.log('[media] (auto) cleanup: tracks stopped');
    };
  }, []);

  return stream;
}
