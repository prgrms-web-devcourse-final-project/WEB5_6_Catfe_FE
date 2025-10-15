import type { Metadata } from 'next';
import SearchBar from '@/components/study-rooms-list/SearchBar';
import FilterTabs from '@/components/study-rooms-list/FilterTabs';
import InviteEnterButton from '@/components/study-rooms-list/InviteEnterButton';
import StudyRoomList from '@/components/study-rooms-list/StudyRoomList';

export const metadata: Metadata = {
  title: 'Catfé | StudyRooms',
  description: '고양이들이 모여있는 스터디룸 전체 목록입니다.',
};

export type SortKey = 'all' | 'public' | 'enter' | 'popular';

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
  const search = (sp.search ?? '').trim();
  const sort: SortKey = (sp.sort as SortKey) ?? 'all';

  return (
    <section className="mx-auto w-full max-w-[1200px] min-h-dvh sm:px-[100px] py-6">
      <SearchBar search={search} sort={sort} />
      <div className="flex justify-end mb-8">
        <InviteEnterButton></InviteEnterButton>
      </div>
      <FilterTabs search={search} sort={sort} />
      <StudyRoomList sort={sort} />
    </section>
  );
}
