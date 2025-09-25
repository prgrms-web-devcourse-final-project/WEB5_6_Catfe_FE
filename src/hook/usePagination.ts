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
    const items: PaginationItem[] = [];

    // 1 ... ( 가운데 ) ... last 구조에서 가운데에 표시될 버튼 그룹의 시작~끝 위치 계산
    // 시작점은 현재 페이지 위치의 한 칸 앞(page-1) 또는 전체 페이지의 4칸 앞(page, page+1, last 빼고), 최소값은 3
    const siblingsStart = Math.max(Math.min(page - 1, totalPages - 4), 3);
    // 끝점은 현재 페이지 위치의 한 칸 뒤 (page+1) 또는 마지막 페이지의 2칸 앞, 최대값은 5
    const siblingsEnd = Math.min(Math.max(page + 1, 5), totalPages - 2);

    // 페이지 추가 헬퍼
    const addPage = (p: number) => {
      items.push({ key: `page-${p}`, type: 'page', page: p, selected: p === page });
    };

    // 처음으로 가기(<<) 아이템 추가
    if (showFirstLast) {
      items.push({ key: 'first', type: 'first', page: 1, disabled: page === 1 });
    }
    // 이전으로 가기(<) 아이템 추가
    if (showPrevNext) {
      items.push({ key: 'prev', type: 'prev', page: page - 1, disabled: page === 1 });
    }

    // 1페이지 추가
    addPage(1);

    // 만약에 가운데 필요한 페이지가 많아지면 중간에 ... 삽입하고 페이지 하나씩 넣기
    if (siblingsStart > 3) {
      items.push({ key: 'ellipsis-start', type: 'ellipsis' });
    } else if (totalPages > 2) {
      addPage(2);
    }

    for (let p = siblingsStart; p <= siblingsEnd; p++) addPage(p);

    if (siblingsEnd < totalPages - 2) {
      items.push({ key: 'ellipsis-end', type: 'ellipsis' });
    } else if (totalPages > 2) {
      addPage(totalPages - 1);
    }

    // 마지막 페이지 추가
    addPage(totalPages);

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
