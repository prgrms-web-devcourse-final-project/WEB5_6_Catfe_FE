'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StudyRoomCard from '@/components/study-room/StudyRoomCard';
import EnterPasswordModal from '@/components/study-room/EnterPasswordModal';
import Pagination from '@/components/Pagination';
import { getMyRooms } from '@/api/apiRooms';
import type { MyRoomsList } from '@/@types/rooms';

const PAGE_SIZE = 6;

export default function MyList() {
  const router = useRouter();
  const params = useSearchParams();

  const currentPage = Math.max(1, Number(params.get('page') ?? 1));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<MyRoomsList[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pwOpen, setPwOpen] = useState(false);
  const [pending, setPending] = useState<MyRoomsList | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyRooms(currentPage - 1, PAGE_SIZE);
        if (!mounted) return;

        setRows(data?.content ?? []);
        setTotalPages(data?.totalPages ?? 1);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : '내 캣페 목록을 불러오지 못했어요.';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentPage]);

  const enterRoom = useCallback(
    (room: MyRoomsList) => {
      if (room.isPrivate) {
        setPending(room);
        setPwOpen(true);
      } else {
        router.push(`/study-rooms/${room.roomId}`);
      }
    },
    [router]
  );

  const closePw = useCallback(() => {
    setPwOpen(false);
    setPending(null);
  }, []);

  const handleSuccess = useCallback(() => {
    if (!pending) return;
    const id = pending.roomId;
    closePw();
    router.push(`/study-rooms/${id}`);
  }, [pending, closePw, router]);

  return (
    <section id="my-rooms" className="flex flex-col gap-5 mb-10">
      <h2 className="text-sm font-semibold text-text-primary">내 캣페</h2>

      {loading && (
        <div className="w-full py-16 text-center text-text-secondary">불러오는 중이에요...</div>
      )}

      {!loading && error && (
        <div className="w-full py-16 text-center text-red-500">{error}</div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="w-full py-16 text-center text-text-secondary">
          아직 내 캣페가 없어요 😿
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div
          id="my-rooms-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
        >
          {rows.map((room) => (
            <StudyRoomCard
              key={room.roomId}
              title={room.title}
              description={room.description}
              coverSrc={null}
              isPrivate={room.isPrivate}
              clickable
              onClick={() => enterRoom(room)}
            />
          ))}
        </div>
      )}

      <Pagination totalPages={totalPages} scrollContainer="#my-rooms" />

      <EnterPasswordModal
        open={pwOpen}
        onClose={closePw}
        expectedPassword={null}
        onSuccess={handleSuccess}
      />
    </section>
  );
}
