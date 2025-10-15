import { Metadata } from "next";
import RoomContent from "./RoomContent";

export const metadata: Metadata = {
  title: 'Catfé | StudyRoom ',
  description: '스터디룸에 입장하셨습니다! 열공하세요😺',
};

export default function StudyRoomPage() {

  return <RoomContent />;
}
