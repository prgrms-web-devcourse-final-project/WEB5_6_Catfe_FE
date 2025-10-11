"use client";

import type { RoomSnapshotUI, StreamsByUser, UsersListItem } from "@/@types/room";
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
        const stream = (streamsByUser as StreamsByUser)[m.id] ?? null;
        const showVideo = mediaEnabled && !!stream;

        return (
          <Tile
            key={m.id}
            member={m as UsersListItem}
            stream={showVideo ? stream : null}
          />
        );
      })}
    </div>
  );
}
