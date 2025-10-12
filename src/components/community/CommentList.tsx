'use client';

import CommentRootItem from './CommentRootItem';
import CommentEditor from './CommentEditor';
import { useSearchParams } from 'next/navigation';
import { useComments } from '@/hook/useCommunityPost';
import Pagination from '../Pagination';

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

  const comments = commentsResponse?.data?.content || [];
  const totalPages = commentsResponse?.data?.totalPages || 0;

  const handleSubmit = async ({ content }: { content: string }) => {
    // !! 임시 console: API 붙여서 mutateAsync 시킬 것
    console.log('댓글 작성 완료:', { postId, content });
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
