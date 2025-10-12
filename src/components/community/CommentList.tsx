'use client';

import CommentRootItem from './CommentRootItem';
import CommentEditor from './CommentEditor';
import { useSearchParams } from 'next/navigation';
import { useComments, useCreateCommentMutation } from '@/hook/community/useCommunityPost';
import Pagination from '../Pagination';
import showToast from '@/utils/showToast';
import { useCommentSortUrl } from '@/hook/community/useCommentSortUrl';
import SortSelector, { COMMENT_SORT_OPTIONS, CommentSort } from './SortSelector';

interface CommentListProps {
  postId: number;
}

const PAGE_SIZE = 10;

function CommentList({ postId }: CommentListProps) {
  const searchParams = useSearchParams();
  const urlPageParam = Number(searchParams.get('page')) || 1;
  const currentPage = urlPageParam - 1; // 1-based URL page -> 0-based API page
  const { currentSort, replaceSort } = useCommentSortUrl();

  const { data: commentsResponse, isLoading } = useComments(
    postId,
    currentPage,
    PAGE_SIZE,
    currentSort
  );
  const { mutateAsync: createCommentMutate } = useCreateCommentMutation();

  const comments = commentsResponse?.data?.items || [];
  const totalPages = commentsResponse?.data?.totalPages || 0;

  const handleSubmit = async ({ content }: { content: string }) => {
    try {
      await createCommentMutate({ postId, content });
      showToast('success', '댓글이 등록되었습니다.');
    } catch (error) {
      console.error('루트 댓글 작성 실패:', error);
      showToast('error', '댓글 작성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  if (!commentsResponse && !isLoading) return null;

  return (
    <div className="flex flex-col gap-4">
      <CommentEditor target={{ postId }} onSubmit={handleSubmit} />
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <div className="h-16 rounded-md animate-pulse bg-gray-400" />
          <div className="h-16 rounded-md animate-pulse bg-gray-400" />
        </div>
      ) : (comments?.length ?? 0) === 0 ? (
        <p className="text-sm text-text-secondary">아직 댓글이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <SortSelector<CommentSort>
            id="comment-sort"
            currentSort={currentSort}
            options={COMMENT_SORT_OPTIONS}
            onChange={replaceSort}
          />
          {comments.map((comment) => (
            <CommentRootItem key={comment.commentId} comment={comment} />
          ))}
          <Pagination
            totalPages={totalPages}
            defaultPage={urlPageParam} // URL page는 1-based
            scrollContainer="#comment-list-container"
          />
        </div>
      )}
    </div>
  );
}
export default CommentList;
