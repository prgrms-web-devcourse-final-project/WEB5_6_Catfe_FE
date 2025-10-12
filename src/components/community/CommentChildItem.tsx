'use client';

import { ReplyComment } from '@/@types/community';
import { useState, memo } from 'react';
import UserProfile from './UserProfile';
import Image from 'next/image';
import LikeButton from '../LikeButton';
import { useDeleteCommentMutation, useUpdateCommentMutation } from '@/hook/useCommunityPost';
import { useParams } from 'next/navigation';
import showToast from '@/utils/showToast';
import { useConfirm } from '@/hook/useConfirm';
import CommentEditor from './CommentEditor';

function CommentChildItem({ reply }: { reply: ReplyComment }) {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const confirm = useConfirm();

  // ⭐️ Mutation 훅 호출
  const { mutateAsync: updateCommentMutate } = useUpdateCommentMutation();
  const { mutateAsync: deleteCommentMutate } = useDeleteCommentMutation();

  const {
    commentId,
    author,
    content,
    likeCount: likeCountProp = 0,
    likedByMe = false,
    createdAt,
    updatedAt,
  } = reply;

  const [liked, setLiked] = useState<boolean>(likedByMe);
  const [likeCount, setLikeCount] = useState<number>(likeCountProp);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // user 정보 붙이기 전 임시 코드
  const isAuthor = true;

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((c) => c + (liked ? -1 : 1));
  };

  const handleUpdate = async ({ content }: { content: string }) => {
    try {
      await updateCommentMutate({ postId, commentId, content });
      showToast('success', '댓글이 수정되었습니다.');
      setIsEditing(false);
    } catch (error) {
      console.error('대댓글 수정 실패:', error);
      showToast('error', '댓글 수정에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleDelete = async () => {
    const confirmOk = await confirm({
      title: '댓글을 삭제하시겠습니까?',
      description: <>삭제된 댓글은 복원할 수 없습니다.</>,
      confirmText: '삭제하기',
      cancelText: '돌아가기',
      tone: 'danger',
    });
    if (!confirmOk) return;

    try {
      await deleteCommentMutate({ postId, commentId });
      showToast('success', '댓글이 삭제되었습니다.');
    } catch (error) {
      console.error('대댓글 삭제 실패:', error);
      showToast('error', '댓글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="rounded-lg w-full p-4 flex flex-col gap-3">
      <header className="flex justify-between">
        <UserProfile author={author} createdAt={createdAt} updatedAt={updatedAt} isComment={true} />
        {isAuthor && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              aria-label="댓글 수정"
              className="cursor-pointer"
            >
              <Image
                src="/icon/community/pencil.svg"
                alt=""
                width={14}
                height={14}
                unoptimized
                priority={false}
              />
            </button>
            <button onClick={handleDelete} aria-label="댓글 삭제" className="cursor-pointer">
              <Image
                src="/icon/community/trash.svg"
                alt=""
                width={14}
                height={14}
                unoptimized
                priority={false}
              />
            </button>
          </div>
        )}
      </header>
      {isEditing ? (
        <CommentEditor
          target={{ postId, commentId }}
          initialContent={content ?? ''}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isEditMode={true}
        />
      ) : (
        <main className="text-sm font-light mb-2">{content}</main>
      )}
      {!isEditing && (
        <footer className="flex items-center gap-3">
          <LikeButton liked={liked} count={likeCount} onToggle={toggleLike} iconSize={12} />
        </footer>
      )}
    </div>
  );
}
export default memo(CommentChildItem);
