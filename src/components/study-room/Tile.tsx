// src/components/study-room/Tile.tsx
"use client";

import Image from "next/image";
import VideoPlayer from "@/components/webrtc/VideoPlayer";
import type { UsersListItem } from "@/@types/room";

export default function Tile({
  member,
  stream,
  isMedia,
}: {
  member: UsersListItem;
  stream: MediaStream | null;
  isMedia: boolean;
}) {
  const showVideo = isMedia && !!stream;
  const name = member.name ?? member.id;
  const avatar = member.avatarUrl ?? "/image/cat.png";

  return (
    <div className="rounded-xl overflow-hidden border bg-black/5">
      <div className="aspect-video bg-black">
        {showVideo ? (
          <VideoPlayer stream={stream} muted={member.isMe} className="rounded-none" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <div className="flex flex-col items-center text-white/80">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 ring-2 ring-white/20">
                <Image src={avatar} alt={name} fill sizes="64px" />
              </div>
              <span className="text-sm">{name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
