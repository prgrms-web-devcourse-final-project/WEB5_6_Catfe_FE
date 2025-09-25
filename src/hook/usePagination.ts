import type { PaginationItem } from '@/@types/type';
import { useMemo } from 'react';

interface UsePaginationOptions {
  page: number;
  totalPages: number;
  showFirstLast: boolean;
  showPrevNext: boolean;
}

export function usePagination(options: UsePaginationOptions): PaginationItem[] {
  const { page, totalPages, showFirstLast = true, showPrevNext = true } = options;

  return useMemo(() => {
    // 페이지 중복 생성 이슈 -> Set으로 관리
    const pageList = new Set<number>();
    const items: PaginationItem[] = [];

    if (totalPages <= 1) return [];

    // 1페이지, 마지막 페이지 추가
    pageList.add(1);
    pageList.add(totalPages);

    // 현재 페이지와 주변 페이지 (1 ... ( 가운데 ) ... last 구조에서 가운데에 표시될 버튼 그룹)
    for (let i = page - 1; i <= page + 1; i++) {
      if (i > 1 && i < totalPages) {
        pageList.add(i);
      }
    }

    // 페이지 정렬 & 배열 변환
    const sortedPages = Array.from(pageList)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    // 처음으로 가기(<<) 아이템 추가
    if (showFirstLast) {
      items.push({ key: 'first', type: 'first', page: 1, disabled: page === 1 });
    }
    // 이전으로 가기(<) 아이템 추가
    if (showPrevNext) {
      items.push({ key: 'prev', type: 'prev', page: page - 1, disabled: page === 1 });
    }

    // 만약에 가운데 필요한 페이지가 많아지면 중간에 ... 삽입하고 페이지 하나씩 넣기
    let lastPage = 0;
    for (const p of sortedPages) {
      if (lastPage > 0 && p > lastPage + 1) {
        items.push({ key: `ellipsis-mid-${lastPage}-${p}`, type: 'ellipsis' });
      }

      items.push({ key: `page-${p}`, type: 'page', page: p, selected: p === page });
      lastPage = p;
    }

    // 다음으로 가기(>) 아이템 추가
    if (showPrevNext) {
      items.push({
        key: 'next',
        type: 'next',
        page: page + 1,
        disabled: page === totalPages,
      });
    }

    // 끝으로 가기(>>) 아이템 추가
    if (showFirstLast) {
      items.push({ key: 'last', type: 'last', page: totalPages, disabled: page === totalPages });
    }

    return items;
  }, [page, totalPages, showFirstLast, showPrevNext]);
}
