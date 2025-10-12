'use client';

import type { PaginationItem } from '@/@types/type';
import { usePagination } from '@/hook/usePagination';
import { scrollToTopPage } from '@/utils/scrollToTopPage';
import tw from '@/utils/tw';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useCallback, useEffect } from 'react';

interface PaginationProps {
  totalPages: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  disabled?: boolean;
  className?: string;
  itemRenderer?: (
    item: PaginationItem,
    defaultNode: React.ReactNode,
    onClick: () => void
  ) => React.ReactNode;
  scrollOnChange?: ScrollBehavior;
  scrollContainer?: string | React.RefObject<HTMLElement>;
  queryParamName?: string;
}

const MIN_LARGE_PAGES = 10;
const DEFAULT_QUERY_PARAM_NAME = 'page';

function Pagination({
  totalPages,
  defaultPage = 1,
  onPageChange,
  disabled = false,
  className = '',
  itemRenderer,
  scrollOnChange = 'smooth',
  scrollContainer,
  queryParamName = DEFAULT_QUERY_PARAM_NAME,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // url에 page 정보가 있으면 사용, 없으면 default
  const urlPage = Number(params.get(queryParamName) ?? defaultPage);
  // 페이지 값 min - max 설정
  const currentPage = (urlPage > totalPages ? totalPages : urlPage) || 1;
  const page = Math.max(1, currentPage);

  // 페이지 이동 시 url 업데이트
  const replaceUrl = useCallback(
    (n: number) => {
      // 페이지 번호 이동 제한
      const clamp = Math.max(1, Math.min(totalPages, n));

      const searchParam = new URLSearchParams(params.toString());
      searchParam.set(queryParamName, String(clamp));

      router.replace(`${pathname}?${searchParam.toString()}`, { scroll: false });
      onPageChange?.(clamp);
    },
    [params, pathname, router, totalPages, onPageChange, queryParamName]
  );

  // page 이동 시 스크롤 최상단으로 이동 (함수 분리)
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToTopPage(scrollContainer, scrollOnChange);
    });
  }, [page, scrollContainer, scrollOnChange]);

  const setPage = useCallback((next: number) => replaceUrl(next), [replaceUrl]);

  // 처음 ~ 끝은 총 페이지가 10개 이상일 경우만 표시
  const showFirstLast = totalPages >= MIN_LARGE_PAGES;
  const showPrevNext = true;

  const items = usePagination({
    page,
    totalPages,
    showFirstLast,
    showPrevNext,
  });

  // 좌우 화살표 keyboard event binding
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled || totalPages < 2) return;
      if (e.key === 'ArrowLeft') {
        setPage(page - 1);
      } else if (e.key === 'ArrowRight') {
        setPage(page + 1);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page, setPage, disabled, totalPages]);

  const sizeClasses = tw(
    'h-8 min-w-8 text-sm px-1',
    'md:h-9 sm:min-w-9 sm:text-sm px-2',
    'lg:h-10 lg:min-w-10 lg:text-base px-3'
  );

  // 아이템별 tag & label
  const renderContent = (item: PaginationItem) => {
    switch (item.type) {
      case 'first':
        return (
          <div aria-hidden className="inline-flex gap-1 items-center">
            <div className="relative w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6">
              <Image src="/icon/leftChevronDouble.svg" alt="" fill />
            </div>
            <span>First</span>
          </div>
        );
      case 'prev':
        return (
          <div aria-hidden className="inline-flex gap-1 items-center">
            <div className="relative w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6">
              <Image src="/icon/leftChevron.svg" alt="" fill />
            </div>
            <span>Back</span>
          </div>
        );
      case 'next':
        return (
          <div aria-hidden className="inline-flex gap-1 items-center">
            <div className="relative w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6">
              <Image src="/icon/rightChevron.svg" alt="" fill />
            </div>
            <span>Next</span>
          </div>
        );
      case 'last':
        return (
          <div aria-hidden className="inline-flex gap-1 items-center">
            <div className="relative w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6">
              <Image src="/icon/rightChevronDouble.svg" alt="" fill />
            </div>
            <span>Last</span>
          </div>
        );
      case 'ellipsis':
        return (
          <span className="px-2" aria-hidden>
            ...
          </span>
        );
      case 'page':
      default:
        return item.page;
    }
  };

  const labelForItem = (item: PaginationItem) => {
    switch (item.type) {
      case 'first':
        return '첫 번째 페이지로 이동합니다.';
      case 'prev':
        return '이전 페이지로 이동합니다.';
      case 'next':
        return '다음 페이지로 이동합니다.';
      case 'last':
        return '마지막 페이지로 이동합니다.';
      case 'ellipsis':
        return '더 많은 페이지';
      case 'page':
      default:
        return item.selected
          ? `현재 ${item.page} 페이지입니다.`
          : `${item.page} 페이지로 이동합니다.`;
    }
  };

  // 페이지가 한 장 뿐이면 표시하지 않음
  if (totalPages < 2) return null;

  return (
    <div className="w-full flex justify-center">
      <nav aria-label="pagination" className={tw('inline-flex items-center gap-2', className)}>
        {items.map((item) => {
          const selected = !!item.selected;
          const isButton = item.type !== 'ellipsis';
          const label = labelForItem(item);

          const base = (
            <button
              type="button"
              key={item.key}
              aria-label={label}
              aria-current={selected ? 'page' : undefined}
              disabled={disabled || !!item.disabled || !isButton}
              onClick={() => item.page && setPage(item.page)}
              className={tw(
                'inline-flex items-center justify-center rounded-xl border cursor-pointer',
                'select-none whitespace-nowrap',
                sizeClasses,
                selected
                  ? 'bg-primary-500 text-secondary-50 border-transparent shadow'
                  : 'bg-secondary-50 text-text-primary border-slate-400',
                (disabled || item.disabled) && !selected
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-secondary-100'
              )}
            >
              {renderContent(item)}
            </button>
          );

          if (itemRenderer) {
            return (
              <Fragment key={item.key}>
                {itemRenderer(item, base, () => item.page && setPage(item.page))}
              </Fragment>
            );
          }

          return base;
        })}
      </nav>
    </div>
  );
}
export default Pagination;
