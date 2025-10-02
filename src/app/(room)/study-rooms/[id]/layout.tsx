import type { ReactNode } from "react";
import ClientRoomShell from "./ClientRoomShell";

export const dynamic = "force-dynamic";

type Props = { children: ReactNode; params: Promise<{ id: string }> };

export default async function RoomLayout({ children }: Props) {
  return <ClientRoomShell>{children}</ClientRoomShell>;
}