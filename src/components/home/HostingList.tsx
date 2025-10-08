'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StudyRoomCard from '@/components/study-room/StudyRoomCard';
import Pagination from '@/components/Pagination';
import { getMyHostingRooms } from '@/api/apiRooms';
import type { MyRoomsList } from '@/@types/rooms';

const PAGE_SIZE = 6;

export default function HostingList() {
  const router = useRouter();
  const params = useSearchParams();

  const currentPage = useMemo(() => {
    const raw = params.get('page');
    const n = Number(raw ?? 1);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  }, [params]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<MyRoomsList[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const pageRes = await getMyHostingRooms(currentPage - 1, PAGE_SIZE);
        if (!alive) return;
        setRows(pageRes.content);
        setTotalPages(pageRes.totalPages);
      } catch {
        if (!alive) return;
        setError('목록을 불러오지 못했어요.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentPage]);

  const enterRoom = useCallback(
    (room: MyRoomsList) => {
      router.push(`/study-rooms/${room.roomId}`);
    },
    [router]
  );

  return (
    <section id="my-hosting" className="flex flex-col gap-5 mb-10">
      <h2 className="font-semibold text-text-primary">내가 만든 캣페</h2>

      {loading && (
        <div className="w-full py-16 text-center text-text-secondary">불러오는 중이에요...</div>
      )}
      {!loading && error && (
        <div className="w-full py-16 text-center text-red-500">{error}</div>
      )}
      {!loading && !error && rows.length === 0 && (
        <div className="w-full py-16 text-center text-text-secondary">
          아직 만든 캣페가 없어요 😺
        </div>
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
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

      <Pagination totalPages={totalPages} scrollContainer="#my-hosting" />
    </section>
  );
}
