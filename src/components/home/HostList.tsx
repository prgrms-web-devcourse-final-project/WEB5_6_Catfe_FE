'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StudyRoomCard from '@/components/study-room/StudyRoomCard';
import EnterPasswordModal from '@/components/study-room/EnterPasswordModal';
import Pagination from '@/components/Pagination';
import { getMyHostingRooms } from '@/api/apiRooms';
import { joinRoom, JoinRoomHttpError } from '@/api/apiJoinRoom';
import { connectRoomSocket } from '@/lib/connectRoomSocket';
import type { MyRoomsList } from '@/@types/rooms';

const PAGE_SIZE = 6;

export default function HostList({ search = '' }: { search?: string }) {
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
  const [pwOpen, setPwOpen] = useState(false);
  const [pending, setPending] = useState<MyRoomsList | null>(null);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const enterRoom = useCallback(
    async (room: MyRoomsList) => {
      try {
        await connectRoomSocket();

        if (room.isPrivate) {
          setPending(room);
          setPwOpen(true);
          return;
        }

        await joinRoom(room.roomId);
        router.push(`/study-rooms/${room.roomId}`);
      } catch (e) {
        if (e instanceof JoinRoomHttpError) {
          if (e.status === 400 && e.data === 'FULL') {
            alert('정원이 가득 찼어요.');
          } else if (e.status === 404) {
            alert('존재하지 않는 방입니다.');
          } else if (e.status === 401) {
            alert('로그인이 필요해요.');
          } else {
            alert(e.message);
          }
        } else {
          alert('입장 중 오류가 발생했어요.');
        }
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
    <section id="my-hosting" className="flex flex-col gap-5 mb-10">
      <h2 className="font-semibold text-text-primary">내가 만든 캣페</h2>

      {loading && (
        <div className="w-full py-16 text-center text-text-secondary">
          불러오는 중이에요...
        </div>
      )}
      {!loading && error && (
        <div className="w-full py-16 text-center text-error-500">{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="w-full py-16 text-center text-text-secondary">
          {search.trim() ? '검색 결과가 없어요.' : '아직 만든 캣페가 없어요 😺'}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {filtered.map((room) => (
            <StudyRoomCard
              key={room.roomId}
              title={room.title}
              description={room.description}
              coverSrc={room.thumbnailUrl ?? null}
              isPrivate={room.isPrivate}
              clickable
              onClick={() => enterRoom(room)}
            />
          ))}
        </div>
      )}

      <Pagination totalPages={totalPages} scrollContainer="#my-hosting" />

      {pending && (
        <EnterPasswordModal
          open={pwOpen}
          onClose={closePw}
          roomId={pending.roomId}
          onSuccess={handleSuccess}
        />
      )}
    </section>
  );
}
