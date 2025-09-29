import type { ReactNode } from "react";
import ClientRoomShell from "./ClientRoomShell";

export const dynamic = "force-dynamic";

type Props = { children: ReactNode; params: { roomId: string } };

export default async function RoomLayout({ children, params }: Props) {
  // 더미 데이터 (직렬화 가능한 값)
  const summary = { id: params.roomId, title: "우리의 방", memberCount: 8 };

  return (
    <ClientRoomShell memberCount={summary.memberCount}>
      {children}
    </ClientRoomShell>
  );
}
