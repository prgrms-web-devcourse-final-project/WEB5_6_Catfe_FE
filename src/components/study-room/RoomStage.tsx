"use client";

import type { RoomSnapshotUI, StreamsByUser, UsersListItem } from "@/@types/rooms";
import Tile from "./Tile";

type MediaFlags = { micOn?: boolean; camOn?: boolean; screenOn?: boolean };

type Props = {
  room: RoomSnapshotUI;
  streamsByUser?: StreamsByUser;
  mediaSelf?: MediaFlags;
  mediaRemote?: Record<string, MediaFlags>;
};

export default function RoomStage({
  room,
  streamsByUser = {},
  mediaSelf,
  mediaRemote = {},
}: Props) {
  const mediaEnabled = !!room.info.mediaEnabled;
  const memberCount = room.members.length;

  const getGridCols = () => {
    if (memberCount <= 4) return "grid-cols-2";
    if (memberCount <= 11) return "grid-cols-3";
    return "grid-cols-4";
  };

  return (
    <div className={`grid gap-4 justify-center grid-cols-2 sm:${getGridCols()} transition-all duration-300`}>
      {room.members.map((m) => {
        const uid = typeof m.id === "number" ? `u-${m.id}` : String(m.id);
        const stream = (streamsByUser as StreamsByUser)[uid] ?? null;

        let micOn = true;
        let camOn = !!stream;

        if (m.isMe && mediaSelf) {
          if (typeof mediaSelf.micOn === "boolean") micOn = mediaSelf.micOn;
          if (typeof mediaSelf.camOn === "boolean") camOn = mediaSelf.camOn;
        } else if (mediaRemote[uid]) {
          const rf = mediaRemote[uid]!;
          if (typeof rf.micOn === "boolean") micOn = rf.micOn;
          if (typeof rf.camOn === "boolean") camOn = rf.camOn;
        } else if (stream) {
          const a = stream.getAudioTracks?.()[0];
          const v = stream.getVideoTracks?.()[0];
          micOn = a ? !a.muted : true;
          camOn = v ? !v.muted : !!stream;
        }

        const showVideo = mediaEnabled && camOn && !!stream;

        return (
          <Tile
            key={uid}
            member={m as UsersListItem}
            stream={showVideo ? stream : null}
            audioOn={micOn}
            videoOn={camOn}
          />
        );
      })}
    </div>
  );
}
