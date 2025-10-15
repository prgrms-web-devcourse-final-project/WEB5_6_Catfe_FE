'use client';

import type { RoomSnapshotUI, UsersListItem } from '@/@types/rooms';
import Tile from '@/components/study-room/Tile';

type Props = {
  room: RoomSnapshotUI;
  meId: string;
};

export default function NonMediaRoomClient({ room, meId }: Props) {
  return (
    <div
      className={[
        'grid gap-3',
        '[grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]',
      ].join(' ')}
    >
      {room.members.map((m) => {
        const member = { ...m, isMe: String(m.id) === meId } as UsersListItem;
        return (
          <Tile
            key={member.id}
            member={member}
            stream={null}
            audioOn={true}
            videoOn={false}
            allowFullscreen={false}
          />
        );
      })}
    </div>
  );
}
