"use client";

import Image from "next/image";
import { useRef, useCallback, useEffect, useState } from "react";
import VideoPlayer from "@/components/webrtc/VideoPlayer";
import type { UsersListItem } from "@/@types/rooms";
import MicOffBadge from "@/components/webrtc/MicOffBadge";
import UserNameBadge from "@/components/webrtc/UserNameBadge";

declare global {
  interface Document {
    webkitFullscreenElement?: Element | null;
  }
}

const CONTROL_BAR_RESERVE = 120;

export default function Tile({
  member,
  stream,
  audioOn,
  videoOn,
}: {
  member: UsersListItem;
  stream: MediaStream | null;
  audioOn: boolean;
  videoOn: boolean;
}) {
  const name = (member.name ?? member.id) as string;
  const avatar = member.avatarUrl ?? "/image/cat.png";

  const fsRef = useRef<HTMLDivElement>(null);
  const [isFS, setIsFS] = useState(false);

  useEffect(() => {
    const sync = () =>
      setIsFS(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    sync();
    window.addEventListener("resize", sync);
    document.addEventListener("fullscreenchange", sync);
    return () => {
      window.removeEventListener("resize", sync);
      document.removeEventListener("fullscreenchange", sync);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!fsRef.current) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    } else {
      await fsRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  const showVideo = videoOn && !!stream;

  return (
    <div
      ref={fsRef}
      className={[
        "fs-wrap group relative overflow-hidden border bg-black rounded-xl",
        "w-full",        
        !isFS ? "mx-auto my-3" : "",
      ].join(" ")}
      onDoubleClick={toggleFullscreen}
      role="button"
      title="더블클릭: 전체화면"
      style={
        !isFS
          ? {
              maxWidth: "min(1100px, 92vw)",
            }
          : undefined
      }
    >
      <div
        className={[
          "relative bg-black flex items-center justify-center w-full", 
          isFS ? "h-full" : "aspect-video",
        ].join(" ")}
        style={!isFS ? { maxHeight: `calc(100vh - ${CONTROL_BAR_RESERVE}px)` } : undefined}
      >
        {showVideo ? (
          <VideoPlayer
            stream={stream}
            muted={member.isMe}
            className={[
              "video-el w-full h-full object-contain object-center z-0",
              isFS ? "object-cover" : "",
            ].join(" ")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 ring-2 ring-white/20">
                <Image src={avatar} alt={name} fill sizes="64px" />
              </div>
              <span className="text-sm">{name}</span>
            </div>
          </div>
        )}
        {!member.isMe && !audioOn && <MicOffBadge />}
        {showVideo && <UserNameBadge name={String(name)} />}
        {!isFS && (
          <div
            className={[
              "pointer-events-none absolute inset-x-0 bottom-2 mx-auto w-max",
              "rounded-md px-2 py-1 text-[11px] leading-none",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "bg-black/40 text-white border border-white/30 shadow-sm",
            ].join(" ")}
          >
            더블클릭으로 전체화면
          </div>
        )}
      </div>
      <style jsx global>{`
        .fs-wrap:fullscreen,
        .fs-wrap:-webkit-full-screen {
          border: none;
          border-radius: 0;
        }
      `}</style>
    </div>
  );
}
