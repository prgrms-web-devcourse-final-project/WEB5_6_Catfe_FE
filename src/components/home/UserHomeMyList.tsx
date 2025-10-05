// src/components/my-rooms/MyList.tsx
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

  // 기존 Pagination이 사용하는 쿼리키는 'page'
  const currentPage = Math.max(1, Number(params.get('page') ?? 1));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<MyRoomsList[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // (옵션) 비밀번호 모달 상태 — 현재는 private 정보가 없어 사용하지 않음
  const [pwOpen, setPwOpen] = useState(false);
  const [pending, setPending] = useState<MyRoomsList | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Spring Data JPA: page는 0-based
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

  // 카드 클릭 → 내 방 상세로 이동
  const enterRoom = useCallback((room: MyRoomsList) => {
    router.push(`/study-rooms/${room.roomId}`);
  }, [router]);

  // (옵션) 비번 모달 관련 — 현재는 미사용
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

      {/* 상태별 표시 */}
      {loading && (
        <div className="w-full py-16 text-center text-text-secondary">
          불러오는 중이에요...
        </div>
      )}

      {!loading && error && (
        <div className="w-full py-16 text-center text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="w-full py-16 text-center text-text-secondary">
          아직 내 캣페가 없어요 😿
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
          id="my-rooms-grid"
        >
          {rows.map((room) => (
            <StudyRoomCard
              key={room.roomId}
              title={room.title}
              description={room.description}
              coverSrc={null}
              isPrivate={false} // MyRoomsList에는 private 정보가 없으므로 false 고정
              clickable
              onClick={() => enterRoom(room)}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 (쿼리키: page) */}
      <Pagination totalPages={totalPages} scrollContainer="#my-rooms" />

      {/* (옵션) 비밀번호 모달 — 현재 expectedPassword는 서버 검증 미연동이므로 null */}
      <EnterPasswordModal
        open={pwOpen}
        onClose={closePw}
        expectedPassword={null}
        onSuccess={handleSuccess}
      />
    </section>
  );
}
