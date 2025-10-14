'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudyRoomCard from '@/components/study-room/StudyRoomCard';
import EnterPasswordModal from '@/components/study-room/EnterPasswordModal';
import { getMyRooms } from '@/api/apiRooms';
import { joinRoom, JoinRoomHttpError } from '@/api/apiJoinRoom';
import { connectRoomSocket } from '@/lib/connectRoomSocket';
import type { MyRoomsList } from '@/@types/rooms';

const PAGE_SIZE = 6;

export default function JoinList({ search = '' }: { search?: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<MyRoomsList[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [pending, setPending] = useState<MyRoomsList | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inFlight = useRef(false);

  const hasMore = useMemo(() => {
    if (totalPages === null) return false;
    return page + 1 < totalPages;
  }, [page, totalPages]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setInitialLoading(true);
      setError(null);
      try {
        const data = await getMyRooms(0, PAGE_SIZE);
        if (!alive) return;
        setRows(data.content);
        setPage(data.number);
        setTotalPages(data.totalPages);
      } catch {
        if (!alive) return;
        setError('내가 참여 중인 캣페 목록을 불러오지 못했어요.');
      } finally {
        if (alive) setInitialLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasMore) return;
    inFlight.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const data = await getMyRooms(nextPage, PAGE_SIZE);
      setRows((prev) => {
        const seen = new Set(prev.map((r) => r.roomId));
        const merged = [...prev];
        for (const r of data.content) {
          if (!seen.has(r.roomId)) {
            seen.add(r.roomId);
            merged.push(r);
          }
        }
        return merged;
      });
      setPage(data.number);
      setTotalPages(data.totalPages);
    } catch {
      setError('다음 목록을 불러오지 못했어요.');
    } finally {
      setLoadingMore(false);
      inFlight.current = false;
    }
  }, [page, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) loadMore();
      },
      { root: null, rootMargin: '200px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

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
    <section id="my-rooms" className="flex flex-col gap-5 mb-10">
      <h2 className="font-semibold text-text-primary">내가 참여 중인 캣페</h2>

      {initialLoading && (
        <div className="w-full py-16 text-center text-text-secondary">불러오는 중이에요...</div>
      )}

      {!initialLoading && error && filtered.length === 0 && (
        <div className="w-full py-16 text-center text-error-500">{error}</div>
      )}

      {!initialLoading && !error && filtered.length === 0 && (
        <div className="w-full py-16 text-center text-text-secondary">
          {search.trim() ? '검색 결과가 없어요.' : '아직 내 캣페가 없어요 😿'}
        </div>
      )}

      {filtered.length > 0 && (
        <div
          id="my-rooms-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
        >
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

      {loadingMore && (
        <div className="w-full py-6 text-center text-text-secondary">더 불러오는 중...</div>
      )}

      <div ref={sentinelRef} />

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
