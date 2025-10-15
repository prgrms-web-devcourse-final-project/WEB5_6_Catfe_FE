'use client';

import { RootComment } from '@/@types/community';
import { useState } from 'react';
import UserProfile from './UserProfile';
import Image from 'next/image';
import CommentChildItem from './CommentChildItem';
import LikeButton from '../LikeButton';
import { useParams } from 'next/navigation';
import CommentEditor from './CommentEditor';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentLikeMutation,
  useUpdateCommentMutation,
} from '@/hook/community/useCommunityPost';
import showToast from '@/utils/showToast';
import { useConfirm } from '@/hook/useConfirm';
import { useUser } from '@/api/apiUsersMe';
import useRequireLogin from '@/hook/useRequireLogin';

interface CommentProps {
  comment: RootComment;
}

function CommentRootItem({ comment }: CommentProps) {
  const { data: currentUser } = useUser();
  const currentUserId = currentUser?.userId;

  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const {
    commentId,
    author,
    content,
    likeCount: likeCountProp = 0,
    likedByMe = false,
    createdAt,
    updatedAt,
    replyCount: replyCountProp,
    children,
  } = comment;

  const [liked, setLiked] = useState<boolean>(likedByMe);
  const [likeCount, setLikeCount] = useState<number>(likeCountProp);
  const [openReplies, setOpenReplies] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const confirm = useConfirm();
  const requireLogin = useRequireLogin();

  const { mutateAsync: createCommentMutate } = useCreateCommentMutation();
  const { mutateAsync: updateCommentMutate } = useUpdateCommentMutation();
  const { mutateAsync: deleteCommentMutate } = useDeleteCommentMutation();
  const { mutate: toggleCommentLikeMutate } = useToggleCommentLikeMutation();

  const isAuthor = !!currentUserId && currentUserId === author.id;

  const toggleLike = () => {
    if (!requireLogin(`/community/${postId}`)) return;
    const nextLiked = !liked;
    const nextLikeCount = likeCount + (nextLiked ? 1 : -1);

    // Optimistic Update
    setLiked(nextLiked);
    setLikeCount(nextLikeCount);

    toggleCommentLikeMutate(
      { postId, commentId, isLiked: nextLiked },
      {
        onError: (error) => {
          console.error('댓글 좋아요 토글 실패:', error);
          showToast('error', '좋아요 처리에 실패했습니다. 다시 시도해주세요.');

          // 실패 시 롤백 (Optimistic Update 취소)
          setLiked(!nextLiked);
          setLikeCount(nextLikeCount + (nextLiked ? -1 : 1));
        },
      }
    );
  };

  const replyCount = replyCountProp ?? children?.length ?? 0;

  const handleSubmitReply = async ({
    parentCommentId,
    content,
  }: {
    parentCommentId?: number;
    content: string;
  }) => {
    if (!requireLogin(`/community/${postId}`)) return;
    if (!parentCommentId) return;
    try {
      await createCommentMutate({ postId, parentCommentId, content });
      showToast('success', '댓글이 작성되었습니다.');
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
      showToast('error', '댓글 작성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleUpdate = async ({ content }: { content: string }) => {
    if (!requireLogin(`/community/${postId}`)) return;
    try {
      await updateCommentMutate({ postId, commentId, content });
      showToast('success', '댓글이 수정되었습니다.');
      setIsEditing(false);
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      showToast('error', '댓글 수정에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleDelete = async () => {
    if (!requireLogin(`/community/${postId}`)) return;
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
      console.error('댓글 삭제 실패:', error);
      showToast('error', '댓글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <article className="bg-secondary-50 border border-secondary-600 rounded-lg w-full p-4 flex flex-col gap-3">
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
          isEditMode
        />
      ) : (
        <main className="text-sm font-light mb-1">{content}</main>
      )}
      {!isEditing && (
        <footer className="flex items-center gap-3">
          <LikeButton liked={liked} count={likeCount} iconSize={12} onToggle={toggleLike} />
          <button
            onClick={() => setOpenReplies((prev) => !prev)}
            aria-label="댓글"
            className="cursor-pointer inline-flex gap-1 items-center"
          >
            <div className="relative size-3">
              <Image src="/icon/community/comment.svg" alt="" fill unoptimized priority={false} />
            </div>
            <span className="text-sm">{replyCount}</span>
            <>
              <span className="block mx-1 bg-black rounded-full w-0.5 h-0.5" />
              <span className="text-xs text-text-secondary">
                {openReplies ? '숨기기' : '답글 보기'}
              </span>
            </>
          </button>
        </footer>
      )}

      {openReplies && (
        <div className="bg-secondary-100 w-19/20 ml-auto pb-2 rounded-xl flex flex-col gap-1">
          <CommentEditor
            target={{ postId, parentCommentId: commentId }}
            onSubmit={handleSubmitReply}
            className="m-2 mb-0"
          />
          {children &&
            children.length > 0 &&
            children.map((reply) => <CommentChildItem key={reply.commentId} reply={reply} />)}
        </div>
      )}
    </article>
  );
}
export default CommentRootItem;
