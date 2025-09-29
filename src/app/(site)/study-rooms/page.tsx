// 개별 스터디룸 페이지 들어가기 위해 임시로 작성해둔 UI입니다.
// 추후 수정 예정입니다.

import RoomList from "@/components/study-room/RoomList";
import { DUMMY_ROOMS } from "@/mock/rooms";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catfé | StudyRooms',
  description: '고양이들이 모여있는 스터디룸 전체 목록입니다.',
};

export default function StudyRoomsPage() {
  const rooms = Object.values(DUMMY_ROOMS);
  return (
    <section className="p-6 max-w-[1200px]">
      <h2 className="mb-4 text-xl font-semibold">스터디룸 목록</h2>
      <RoomList rooms={rooms} />
    </section>
  );
}