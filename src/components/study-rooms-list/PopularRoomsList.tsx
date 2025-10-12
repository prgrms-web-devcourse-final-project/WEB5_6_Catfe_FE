"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StudyRoomCard from "@/components/study-room/StudyRoomCard";
import EnterPasswordModal from "@/components/study-room/EnterPasswordModal";
import Pagination from "@/components/Pagination";
import { getPopularRooms } from "@/api/apiRooms";
import type { AllRoomsList } from "@/@types/rooms";

const UI_PAGE_SIZE = 12;
const SERVER_PAGE_SIZE = 60;

export default function PopularRoomsList() {
  const router = useRouter();
  const params = useSearchParams();

  const urlPage = useMemo(() => Math.max(1, Number(params.get("page") ?? 1)), [params]);
  const keyword = useMemo(() => (params.get("search") ?? "").trim(), [params]);

  const [rows, setRows] = useState<AllRoomsList[]>([]);
  const [serverTotalPages, setServerTotalPages] = useState<number>(1);
  const [allRows, setAllRows] = useState<AllRoomsList[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pwOpen, setPwOpen] = useState(false);
  const [pending, setPending] = useState<AllRoomsList | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);

  const fetchServerPage = useCallback(async (oneBasePage: number) => {
    setLoading(true);
    setError(null);
    try {
      const zeroBase = Math.max(0, oneBasePage - 1);
      const res = await getPopularRooms(zeroBase, UI_PAGE_SIZE);
      setRows(res.content);
      setServerTotalPages(res.totalPages || 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllThenFilter = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const first = await getPopularRooms(0, SERVER_PAGE_SIZE);
      let acc = first.content.slice();
      for (let p = 1; p < (first.totalPages || 1); p++) {
        const r = await getPopularRooms(p, SERVER_PAGE_SIZE);
        acc = acc.concat(r.content);
      }
      setAllRows(acc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했어요.");
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (keyword) {
      setAllRows(null);
      fetchAllThenFilter();
    } else {
      setAllRows(null);
      fetchServerPage(urlPage);
    }
  }, [keyword, urlPage, fetchServerPage, fetchAllThenFilter]);

  const baseRows = useMemo(
    () => (keyword ? (allRows ?? []) : rows),
    [keyword, allRows, rows]
  );

  const filteredRows = useMemo(() => {
    if (!keyword) return baseRows;
    const low = keyword.toLowerCase();
    return baseRows.filter((r) => {
      const hay = `${r.title ?? ""} ${r.description ?? ""}`.toLowerCase();
      return hay.includes(low);
    });
  }, [baseRows, keyword]);

  const totalPagesForUI = useMemo(() => {
    if (keyword) return Math.max(1, Math.ceil(filteredRows.length / UI_PAGE_SIZE));
    return serverTotalPages;
  }, [keyword, filteredRows.length, serverTotalPages]);

  const currentPageOneBase = useMemo(
    () => Math.min(urlPage, totalPagesForUI),
    [urlPage, totalPagesForUI]
  );

  const pagedRows = useMemo(() => {
    if (keyword) {
      const start = (currentPageOneBase - 1) * UI_PAGE_SIZE;
      return filteredRows.slice(start, start + UI_PAGE_SIZE);
    }
    return filteredRows;
  }, [keyword, filteredRows, currentPageOneBase]);

  const enterRoom = (room: AllRoomsList) => {
    if (room.isPrivate) {
      setPending(room);
      setPwOpen(true);
      setRoomId(room.roomId);
      return;
    }
    router.push(`/study-rooms/${room.roomId}`);
  };

  const closePw = () => {
    setPwOpen(false);
    setPending(null);
  };

  const handleSuccess = () => {
    if (!pending) return;
    const id = pending.roomId;
    closePw();
    router.push(`/study-rooms/${id}`);
  };

  if (loading && (!keyword ? rows.length === 0 : allRows === null)) {
    return <div className="w-full py-16 text-center text-text-secondary">불러오는 중이에요…</div>;
  }
  if (error && (!keyword ? rows.length === 0 : (allRows?.length ?? 0) === 0)) {
    return <div className="w-full py-16 text-center text-red-500">{error}</div>;
  }

  const noData = (!keyword ? rows.length === 0 : (allRows?.length ?? 0) === 0);
  const noMatch = !noData && pagedRows.length === 0;

  return (
    <>
      {noData ? (
        <div className="w-full py-20 text-center text-text-secondary">아직 스터디룸이 없어요 😿</div>
      ) : noMatch ? (
        <div className="w-full py-12 text-center text-text-secondary">검색 결과가 없어요 😿</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8 mb-12">
          {pagedRows.map((room) => (
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

      <Pagination totalPages={totalPagesForUI} defaultPage={1} />

      {roomId && (
        <EnterPasswordModal
          roomId={roomId}
          open={pwOpen}
          onClose={closePw}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
