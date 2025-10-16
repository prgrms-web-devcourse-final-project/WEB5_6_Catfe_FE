'use client';
import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StudyRoomCard from '@/components/study-room/StudyRoomCard';
import EnterPasswordModal from '@/components/study-room/EnterPasswordModal';
import Pagination from '@/components/Pagination';
import type { AllRoomsList } from '@/@types/rooms';
import useRequireLogin from '@/hook/useRequireLogin';

import { SortKey, useRooms } from '@/hook/useStudyRooms';

function StudyRoomList({ sort }: { sort: SortKey }) {
  const router = useRouter();
  const params = useSearchParams();
  const requireLogin = useRequireLogin();

  const urlPage = useMemo(() => Math.max(1, Number(params.get('page') ?? 1)), [params]);
  const keyword = useMemo(() => (params.get('search') ?? '').trim(), [params]);

  const { rows, totalPages, isPending, isFetching, error } = useRooms({
    sort,
    page: urlPage,
    keyword,
  });

  const [pwOpen, setPwOpen] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);

  const enterRoom = (room: AllRoomsList) => {
    const next = `/study-rooms/${room.roomId}`;
    if (!requireLogin(next)) return;
    if (room.isPrivate) {
      setPwOpen(true);
      setRoomId(room.roomId);
      return;
    }
    router.push(next);
  };
  const closePw = () => setPwOpen(false);
  const handleSuccess = () => {
    if (!roomId) return;
    closePw();
    router.push(`/study-rooms/${roomId}`);
  };

  if (isPending && rows.length === 0) {
    return <div className="w-full py-16 text-center text-text-secondary">불러오는 중이에요…</div>;
  }
  if (error && rows.length === 0) {
    return <div className="w-full py-16 text-center text-red-500">{error.message}</div>;
  }
  const noData = rows.length === 0;

  return (
    <div className="relative">
      <div
        className={
          isFetching
            ? 'opacity-60 transition-opacity duration-300'
            : 'opacity-100 transition-opacity duration-300'
        }
      >
        {noData ? (
          <div className="w-full py-20 text-center text-text-secondary">
            {sort === 'enter' ? '아직 입장 가능한 공개방이 없어요 😿' : '아직 스터디룸이 없어요 😿'}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8 mb-12">
            {rows.map((room) => (
              <StudyRoomCard
                key={room.roomId}
                title={room.title}
                description={room.description}
                coverSrc={room.thumbnailUrl ?? null}
                isPrivate={room.isPrivate}
                status={room.status}
                clickable
                onClick={() => enterRoom(room)}
              />
            ))}
          </div>
        )}
        <Pagination totalPages={totalPages} defaultPage={1} />
      </div>
      {isFetching && (
        <div className="pointer-events-none absolute left-0 right-0 top-[-8px] h-[3px] overflow-hidden">
          <div className="progressBar h-full w-1/3 bg-primary-600 rounded" />
        </div>
      )}
      {roomId && (
        <EnterPasswordModal
          roomId={roomId}
          open={pwOpen}
          onClose={closePw}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
export default StudyRoomList;
