'use client';

import { useEffect, useRef } from 'react';

export default function VideoPlayer({
  stream,
  muted = false,
  className = '',
}: {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.srcObject !== stream) {
      el.srcObject = stream ?? null;
    }
    return () => {
      if (ref.current) ref.current.srcObject = null;
    };
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
