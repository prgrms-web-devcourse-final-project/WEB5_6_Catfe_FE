'use client';

import { useMemo } from 'react';
import type { RoomSnapshotUI, UsersListItem, ApiRoomMemberDto, Role } from '@/@types/rooms';
import { useRoomMembersQuery } from '@/hook/useRoomMembers';
import Tile from '@/components/study-room/Tile';

type Props = {
  room: RoomSnapshotUI;
  meId: string;
};

export default function NonMediaRoomClient({ room, meId }: Props) {
  const { data: membersData } = useRoomMembersQuery(room.info.id, {
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 4000,
  });

  const mergedMembers: UsersListItem[] = useMemo(() => {
    if (Array.isArray(membersData) && membersData.length > 0) {
      return (membersData as ApiRoomMemberDto[]).map((m): UsersListItem => ({
        id: Number(m.userId),
        name: m.nickname,
        role: (m.role as Role) ?? 'MEMBER',
        email: m.email ?? '',
        avatarUrl: m.profileImageUrl ?? null,
        isMe: String(m.userId) === meId,
      }));
    }

    return room.members.map((m) => ({
      ...m,
      isMe: String(m.id) === meId,
    })) as UsersListItem[];
  }, [membersData, room.members, meId]);

  return (
    <div
      className={[
        'grid gap-3',
        '[grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]',
      ].join(' ')}
    >
      {mergedMembers.map((member) => (
        <Tile
          key={member.id}
          member={member}
          stream={null}
          audioOn={true}
          videoOn={false}
          allowFullscreen={false}
          roomId={room.info.id}
        />
      ))}
    </div>
  );
}
