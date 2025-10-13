'use client';

export type PostSort = 'createdAt,desc' | 'createdAt,asc' | 'likeCount,desc' | 'commentCount,desc';
export type CommentSort = 'createdAt,desc' | 'createdAt,asc' | 'likeCount,desc';

interface SortOption<T extends string> {
  label: string;
  value: T;
}

export const POST_SORT_OPTIONS: SortOption<PostSort>[] = [
  { label: '최신순', value: 'createdAt,desc' },
  { label: '오래된순', value: 'createdAt,asc' },
  { label: '좋아요순', value: 'likeCount,desc' },
  { label: '댓글순', value: 'commentCount,desc' },
];

export const COMMENT_SORT_OPTIONS: SortOption<CommentSort>[] = [
  { label: '최신순', value: 'createdAt,desc' },
  { label: '오래된순', value: 'createdAt,asc' },
  { label: '좋아요순', value: 'likeCount,desc' },
];

interface SortSelectorProps<T extends string> {
  id: string;
  currentSort: T;
  options: SortOption<T>[];
  onChange: (sortValue: T) => void;
}

function SortSelector<T extends string>({
  id,
  currentSort,
  options,
  onChange,
}: SortSelectorProps<T>) {
  return (
    <div className="w-full flex justify-end items-center gap-3">
      <span className="text-sm text-text-secondary">정렬 : </span>
      <select
        id={id}
        value={currentSort}
        onChange={(e) => onChange(e.target.value as T)}
        className="border border-zinc-300 rounded-md p-1 text-sm outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
export default SortSelector;
