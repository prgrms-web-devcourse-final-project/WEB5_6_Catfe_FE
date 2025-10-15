import { AllRoomsList } from '@/@types/rooms';
import {
  getAllRooms,
  getEnterRooms,
  getPopularRooms,
  getPublicRooms,
  PageResponse,
} from '@/api/apiRooms';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

export type SortKey = 'all' | 'public' | 'popular' | 'enter';

const UI_PAGE_SIZE = 12; // 카드 그리드 페이지
const SERVER_PAGE_SIZE = 60; // 전량 페치 단위(검색 시)

function selectFetcher(sort: SortKey) {
  switch (sort) {
    case 'public':
      return getPublicRooms;
    case 'popular':
      return getPopularRooms;
    case 'enter':
      return getEnterRooms;
    default:
      return getAllRooms;
  }
}

export function useRooms(params: { sort: SortKey; page: number; keyword: string }) {
  const { sort, page, keyword } = params;
  const fetcher = selectFetcher(sort);

  const query = useQuery({
    queryKey: ['rooms', sort, page, keyword || ''],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<PageResponse<AllRoomsList>> => {
      // 검색어 없음: 서버 페이지네이션 그대로
      if (!keyword) {
        const zeroBase = Math.max(0, page - 1);
        return fetcher(zeroBase, UI_PAGE_SIZE);
      }
      // 검색어 있음: 전량 페치 후 필터 + UI 페이지네이션
      const first = await fetcher(0, SERVER_PAGE_SIZE);
      const totalPages = first.totalPages ?? 1;

      let acc = first.content.slice();
      for (let p = 1; p < totalPages; p++) {
        const r = await fetcher(p, SERVER_PAGE_SIZE);
        acc = acc.concat(r.content);
      }

      const low = keyword.toLowerCase();
      const filtered = acc.filter((r) =>
        `${r.title ?? ''} ${r.description ?? ''}`.toLowerCase().includes(low)
      );

      const start = (page - 1) * UI_PAGE_SIZE;
      const pageSlice = filtered.slice(start, start + UI_PAGE_SIZE);

      return {
        content: pageSlice,
        totalPages: Math.max(1, Math.ceil(filtered.length / UI_PAGE_SIZE)),
        number: page - 1,
        size: UI_PAGE_SIZE,
        totalElements: filtered.length,
      };
    },
  });

  const qc = useQueryClient();
  const nextPage = (query.data?.totalPages ?? 1) > page && keyword === '' ? page + 1 : null;

  if (nextPage) {
    qc.prefetchQuery({
      queryKey: ['rooms', sort, nextPage, ''],
      queryFn: async () => {
        return selectFetcher(sort)(Math.max(0, nextPage - 1), UI_PAGE_SIZE);
      },
      staleTime: 30_000,
    });
  }

  return {
    rows: query.data?.content ?? [],
    totalPages: query.data?.totalPages ?? 1,
    isPending: query.isPending,
    isFetching: query.isFetching,
    error: query.error as Error | null,
  };
}
