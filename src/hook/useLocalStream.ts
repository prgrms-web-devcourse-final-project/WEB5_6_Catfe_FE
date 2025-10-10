"use client";

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
        const s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!active) {
          s.getTracks().forEach(t => t.stop());
          return;
        }
        setStream(s);
      } catch (e) {
        console.error("getUserMedia 실패:", e);
      }
    })();

    return () => {
      active = false;
      setStream(prev => {
        prev?.getTracks().forEach(t => t.stop());
        return null;
      });
    };
  }, []);

  return stream;
}
