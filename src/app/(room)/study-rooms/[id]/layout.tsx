import type { ReactNode } from "react";
import ClientRoomShell from "./ClientRoomShell";
// import WebRTCContainer from "@/components/webrtc/WebRTCContainer";

export const dynamic = "force-dynamic";

type Props = { children: ReactNode; params: { id: string } };

export default function RoomLayout({ params, children }: Props) {
  const idNum = Number(params.id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    throw new Error("잘못된 방 ID");
  }
  return <ClientRoomShell roomId={idNum}>{children}</ClientRoomShell>;
}