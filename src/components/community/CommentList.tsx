'use client';

import CommentRootItem from './CommentRootItem';
import CommentEditor from './CommentEditor';
import { useSearchParams } from 'next/navigation';
import { useComments, useCreateCommentMutation } from '@/hook/useCommunityPost';
import Pagination from '../Pagination';
import showToast from '@/utils/showToast';

interface CommentListProps {
  postId: number;
}

const PAGE_SIZE = 10;
const COMMENT_SORT = 'createdAt,desc';

function CommentList({ postId }: CommentListProps) {
  const searchParams = useSearchParams();
  const urlPageParam = Number(searchParams.get('page')) || 1;
  const currentPage = urlPageParam - 1; // 1-based URL page -> 0-based API page

  const { data: commentsResponse, isLoading } = useComments(
    postId,
    currentPage,
    PAGE_SIZE,
    COMMENT_SORT
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
        <div>
          {comments.map((comment) => (
            <CommentRootItem key={comment.commentId} comment={comment} />
          ))}
        </div>
      )}

      {/* 페이지네이션 컴포넌트 */}
      <Pagination
        totalPages={totalPages}
        defaultPage={urlPageParam} // URL page는 1-based
        scrollContainer="#comment-list-container" // 필요하다면 스크롤 컨테이너 지정
      />
    </div>
  );
}
export default CommentList;
