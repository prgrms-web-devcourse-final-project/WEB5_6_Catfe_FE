import type { Metadata } from "next";
import { MOCK_ROOMS_20 } from "@/lib/mockRooms";
import type { RoomDetail } from "@/@types/roomss";

import SearchBar from "@/components/study-rooms-list/SearchBar";
import FilterTabs from "@/components/study-rooms-list/FilterTabs";
import RoomsList from "@/components/study-rooms-list/RoomsList";
import Pagination from "@/components/Pagination";

export const metadata: Metadata = {
  title: "Catfé | StudyRooms",
  description: "고양이들이 모여있는 스터디룸 전체 목록입니다.",
};

type SortKey = "all" | "time" | "popular";

type SearchParams = {
  search?: string;
  sort?: SortKey;
  page?: string;
};

const PAGE_SIZE = 12;

export default async function StudyRoomsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const search = (sp.search ?? "").trim();
  const sort: SortKey = (sp.sort as SortKey) ?? "all";
  const page = Math.max(1, Number(sp.page ?? 1));

  // 풀목록
  const all: RoomDetail[] = MOCK_ROOMS_20.map((r) => r.data);

  // 검색
  const filtered = all.filter((r) => {
    if (!search) return true;
    const hay = `${r.title ?? ""} ${r.description ?? ""}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  // 정렬
  const sorted = (() => {
    switch (sort) {
      case "time":
        return [...filtered].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "popular":
        return [...filtered].sort((a, b) => {
          const diff = (b.currentParticipants ?? 0) - (a.currentParticipants ?? 0);
          return diff !== 0 ? diff : (b.roomId ?? 0) - (a.roomId ?? 0);
        });
      case "all":
      default:
        return filtered;
    }
  })();

  // 페이지네이션
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = sorted.slice(start, start + PAGE_SIZE);

  return (
    <section className="mx-auto w-full max-w-[1200px] py-6">
      <SearchBar search={search} sort={sort} />
      <FilterTabs search={search} sort={sort} />

      <h2 className="mb-4 text-xl font-semibold">Catfé</h2>

      {/* 카드 리스트 */}
      <RoomsList rooms={pageRows} />

      {/* 페이지네이션 */}
      <Pagination totalPages={totalPages} />
    </section>
  );
}
