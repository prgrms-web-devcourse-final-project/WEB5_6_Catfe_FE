import type { ReactNode } from 'react';
import ClientRoomShell from './ClientRoomShell';

interface RoomLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function RoomLayout({ params, children }: RoomLayoutProps) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    throw new Error('잘못된 방 ID');
  }
  return <ClientRoomShell roomId={idNum}>{children}</ClientRoomShell>;
}
