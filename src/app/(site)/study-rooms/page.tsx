import type { Metadata } from "next";
import SearchBar from "@/components/study-rooms-list/SearchBar";
import FilterTabs from "@/components/study-rooms-list/FilterTabs";
import AllRoomsList from "@/components/study-rooms-list/AllRoomsList";
import PopularRoomsList from "@/components/study-rooms-list/PopularRoomsList";
import EnterRoomsList from "@/components/study-rooms-list/EnterRoomsList";
import PublicRoomsList from "@/components/study-rooms-list/PublicRoomsList";
import InviteEnterButton from "@/components/study-rooms-list/InviteEnterButton";

export const metadata: Metadata = {
  title: "Catfé | StudyRooms",
  description: "고양이들이 모여있는 스터디룸 전체 목록입니다.",
};

type SortKey = "all" | "public" | "enter" | "popular";

type SearchParams = {
  search?: string;
  sort?: SortKey;
  page?: string;
};

export default async function StudyRoomsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const search = (sp.search ?? "").trim();
  const sort: SortKey = (sp.sort as SortKey) ?? "all";

  if (sort === "all") {
    return (
      <section className="mx-auto w-full max-w-[1200px] sm:px-[100px] pt-6 pb-10">
        <SearchBar search={search} sort={sort} />
        <div className="flex justify-end mb-8">
          <InviteEnterButton></InviteEnterButton>
        </div>
        <FilterTabs search={search} sort={sort} />
        <h2 className="mb-4 font-semibold">전체 캣페 목록</h2>
        <AllRoomsList />
      </section>
    );
  }

  if (sort === "public") {
    return (
      <section className="mx-auto w-full max-w-[1200px] sm:px-[100px] pt-6 pb-10">
        <SearchBar search={search} sort={sort} />
        <div className="flex justify-end mb-8">
          <InviteEnterButton></InviteEnterButton>
        </div>
        <FilterTabs search={search} sort={sort} />
        <h2 className="mb-4 font-semibold">공개 캣페 목록</h2>
        <PublicRoomsList />
      </section>
    );
  }

  if (sort === "popular") {
    return (
      <section className="mx-auto w-full max-w-[1200px] sm:px-[100px] pt-6 pb-10">
        <SearchBar search={search} sort={sort} />
        <div className="flex justify-end mb-8">
          <InviteEnterButton></InviteEnterButton>
        </div>
        <FilterTabs search={search} sort={sort} />
        <h2 className="mb-4 font-semibold">인기순 공개 캣페 목록</h2>
        <PopularRoomsList />
      </section>
    );
  }

  if (sort === "enter") {
    return (
      <section className="mx-auto w-full max-w-[1200px] sm:px-[100px] pt-6 pb-10">
        <SearchBar search={search} sort={sort} />
        <div className="flex justify-end mb-8">
          <InviteEnterButton></InviteEnterButton>
        </div>
        <FilterTabs search={search} sort={sort} />
        <h2 className="mb-4 font-semibold">입장 가능한 공개 캣페 목록</h2>
        <EnterRoomsList />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1200px] sm:px-[100px] py-6">
      <SearchBar search={search} sort={sort} />
      <div className="flex justify-end mb-8">
          <InviteEnterButton></InviteEnterButton>
        </div>
      <FilterTabs search={search} sort={sort} />
      <h2 className="mb-4 font-semibold">전체 캣페 목록</h2>
      <AllRoomsList />
    </section>
  );
}
