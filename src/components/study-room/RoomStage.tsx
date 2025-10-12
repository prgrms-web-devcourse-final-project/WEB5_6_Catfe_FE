"use client";

import type { RoomSnapshotUI, StreamsByUser, UsersListItem } from "@/@types/room";
import Tile from "./Tile";

<<<<<<< HEAD
type Props = {
=======
export default function RoomStage({
  room,
  streamsByUser,
}: {
>>>>>>> 7b9b1ce (브랜치 최신화)
  room: RoomSnapshotUI;
  streamsByUser?: StreamsByUser;
};

export default function RoomStage({ room, streamsByUser = {} }: Props) {
  const mediaEnabled = !!room.info.mediaEnabled;

  return (
    <div className="grid grid-cols-2 gap-4">
      {room.members.map((m) => {
<<<<<<< HEAD
        const stream = (streamsByUser as StreamsByUser)[m.id] ?? null;
        const showVideo = mediaEnabled && !!stream;
=======
        const stream = streamsByUser?.[m.id] ?? null;

        const showVideo = isMedia && !!stream;
>>>>>>> 7b9b1ce (브랜치 최신화)

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
