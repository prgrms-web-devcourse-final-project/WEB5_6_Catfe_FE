"use client";

import Image from "next/image";
import { useRef, useCallback } from "react";
import VideoPlayer from "@/components/webrtc/VideoPlayer";
import type { UsersListItem } from "@/@types/rooms";
import MicOffBadge from "@/components/webrtc/MicOffBadge";
import UserNameBadge from "@/components/webrtc/UserNameBadge";

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
  const toggleFullscreen = useCallback(async () => {
    if (!fsRef.current) return;
    if (!document.fullscreenElement) await fsRef.current.requestFullscreen().catch(() => {});
    else await document.exitFullscreen().catch(() => {});
  }, []);

  const showVideo = videoOn && !!stream;

  return (
    <div
      ref={fsRef}
      className="fs-wrap relative rounded-xl overflow-hidden border bg-black"
      onDoubleClick={toggleFullscreen}
      role="button"
      title="더블클릭: 전체화면"
    >
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {showVideo ? (
          <VideoPlayer
            stream={stream}
            muted={member.isMe}
            className="video-el w-full h-full object-contain object-center z-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black text-white">
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
      </div>
    </div>
  );
}
