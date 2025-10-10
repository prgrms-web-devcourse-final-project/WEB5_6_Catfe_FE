// src/components/study-room/RoomStage.tsx
"use client";
import type { RoomSnapshotUI, StreamsByUser } from "@/@types/room";
import Tile from "./Tile";


export default function RoomStage({
  room,
  streamsByUser,
}: {
  room: RoomSnapshotUI;
  streamsByUser?: StreamsByUser;
}) {
  const isMedia = room.info.mediaEnabled;

  return (
    <div className="grid grid-cols-2 gap-4">
      {room.members.map((m) => {
        const stream = streamsByUser?.[m.id] ?? null;
        const showVideo = isMedia && !!m.media?.camOn && !!stream;
        return (
          <Tile
            key={m.id}
            member={m}
            stream={showVideo ? stream : null}
            isMedia={isMedia}
          />
        );
      })}
    </div>
  );
}
