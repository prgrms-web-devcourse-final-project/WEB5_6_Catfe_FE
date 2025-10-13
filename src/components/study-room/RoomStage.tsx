"use client";

import type { RoomSnapshotUI, StreamsByUser, UsersListItem } from "@/@types/rooms";
import Tile from "./Tile";

type Props = {
  room: RoomSnapshotUI;
  streamsByUser?: StreamsByUser;
};

export default function RoomStage({ room, streamsByUser = {} }: Props) {
  const mediaEnabled = !!room.info.mediaEnabled;

  return (
    <div className="grid grid-cols-2 gap-4">
      {room.members.map((m) => {
        const id = typeof m.id === 'number' ? `u-${m.id}` : String(m.id);
        const stream = (streamsByUser as StreamsByUser)[id] ?? null;
        const showVideo = mediaEnabled && !!stream;

        return (
          <Tile
            key={id}
            member={m as UsersListItem}
            stream={showVideo ? stream : null}
          />
        );
      })}
    </div>
  );
}
