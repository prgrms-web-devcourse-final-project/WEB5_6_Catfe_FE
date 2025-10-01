"use client";
import { useEffect, useRef } from "react";

export default function VideoPlayer({ stream }: { stream: MediaStream | null }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return <div className="text-gray-500">카메라 없음</div>;

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      className="rounded-xl w-full border"
    />
  );
}
