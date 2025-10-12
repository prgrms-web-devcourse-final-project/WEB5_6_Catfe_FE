import type { ReactNode } from "react";
import ClientRoomShell from "./ClientRoomShell";
<<<<<<< HEAD
=======
// import WebRTCContainer from "@/components/webrtc/WebRTCContainer";
>>>>>>> 7b9b1ce (브랜치 최신화)

export const dynamic = "force-dynamic";

type Props = { children: ReactNode; params: { id: string } };

<<<<<<< HEAD
export default async function RoomLayout({ params, children }: Props) {
  const { id } = await params;            
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    throw new Error("잘못된 방 ID");
  }
  return <ClientRoomShell roomId={idNum}>{children}</ClientRoomShell>;
}
=======
export default async function RoomLayout({ children }: Props) {
  return <ClientRoomShell>{children}</ClientRoomShell>;
}
>>>>>>> 7b9b1ce (브랜치 최신화)
