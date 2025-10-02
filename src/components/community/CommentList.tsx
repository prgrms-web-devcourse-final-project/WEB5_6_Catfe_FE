'use client';

import { CommentTree } from '@/@types/community';
import CommentRootItem from './CommentRootItem';
import CommentEditor from './CommentEditor';
import { useParams } from 'next/navigation';

interface CommentListProps {
  comments?: CommentTree;
  isLoading?: boolean;
}

function CommentList({ comments, isLoading }: CommentListProps) {
  const { id: postId } = useParams<{ id: string }>();

  if (!comments) return null;

  const handleSubmit = async ({ postId, content }: { postId: string; content: string }) => {
    // !! 임시 console: API 붙여서 mutateAsync 시킬 것
    console.log('댓글 작성 완료:', { postId, content });
  };

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
            <CommentRootItem key={comment.comment_id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
export default CommentList;
