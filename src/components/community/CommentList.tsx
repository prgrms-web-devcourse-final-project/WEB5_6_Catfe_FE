'use client';

import { CommentTree } from '@/@types/community';
import CommentRootItem from './CommentRootItem';

function CommentList({ comments }: { comments: CommentTree }) {
  if (!comments) return null;
  if (comments.length === 0)
    return <p className="text-sm text-text-secondary">아직 댓글이 없습니다.</p>;
  return (
    <div>
      {comments.map((comment) => (
        <CommentRootItem key={comment.comment_id} comment={comment} />
      ))}
    </div>
  );
}
export default CommentList;
