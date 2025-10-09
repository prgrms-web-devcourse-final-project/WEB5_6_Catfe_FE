import type { ReactNode } from "react";
import ClientRoomShell from "./ClientRoomShell";

export const dynamic = "force-dynamic";

type Props = { children: ReactNode; params: { id: string } };


export default async function RoomLayout({ params, children }: Props) {
  const { id } = await params;            
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    throw new Error("잘못된 방 ID");
  }
  return <ClientRoomShell roomId={idNum}>{children}</ClientRoomShell>;
}
