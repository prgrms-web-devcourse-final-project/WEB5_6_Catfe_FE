import { CommentSort } from '@/components/community/SortSelector';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const DEFAULT_SORT: CommentSort = 'createdAt,desc';
const SORT_PARAM_NAME = 'comment_sort';
const PAGE_PARAM_NAME = 'comment_page';

export function useCommentSortUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get(SORT_PARAM_NAME) as CommentSort) || DEFAULT_SORT;

  const replaceSort = (newSort: CommentSort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(SORT_PARAM_NAME, newSort);
    params.set(PAGE_PARAM_NAME, '1'); // 정렬 변경 시 페이지 1로 초기화
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return { currentSort, replaceSort };
}
