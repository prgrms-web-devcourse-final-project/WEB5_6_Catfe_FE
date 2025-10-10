'use client';

import { RootComment } from '@/@types/community';
import { useState } from 'react';
import UserProfile from './UserProfile';
import Image from 'next/image';
import CommentChildItem from './CommentChildItem';
import LikeButton from '../LikeButton';
import { useParams } from 'next/navigation';
import CommentEditor from './CommentEditor';

interface CommentProps {
  comment: RootComment;
}

function CommentRootItem({ comment }: CommentProps) {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const {
    commentId,
    author,
    content,
    likeCount: likeCountProp = 0,
    isLikedByMe = false,
    createdAt,
    updatedAt,
    replyCount: replyCountProp,
    children,
  } = comment;

  const [liked, setLiked] = useState<boolean>(isLikedByMe);
  const [likeCount, setLikeCount] = useState<number>(likeCountProp);
  const [openReplies, setOpenReplies] = useState<boolean>(false);

  // user 정보 붙이기 전 임시 코드
  const isAuthor = true;

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((c) => c + (liked ? -1 : 1));
  };

  const replyCount = replyCountProp ?? children?.length ?? 0;

  const handleSubmitReply = async ({
    postId,
    parentCommentId,
    content,
  }: {
    postId: number;
    parentCommentId?: number;
    content: string;
  }) => {
    // !! 임시 콘솔 -> API 기능 붙여야함
    console.log('reply submit', { postId, parentCommentId, content });
  };

  return (
    <article className="bg-secondary-50 rounded-lg w-full p-4 flex flex-col gap-3">
      <header className="flex justify-between">
        <UserProfile author={author} createdAt={createdAt} updatedAt={updatedAt} isComment={true} />
        {isAuthor && (
          <div className="flex gap-3">
            <button
              onClick={() => console.log('수정')}
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
            <button
              onClick={() => console.log('삭제')}
              aria-label="댓글 삭제"
              className="cursor-pointer"
            >
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
      <main className="text-sm font-light mb-2">{content}</main>
      <footer className="flex items-center gap-3">
        <LikeButton liked={liked} count={likeCount} iconSize={12} onToggle={toggleLike} />
        <button
          onClick={() => setOpenReplies((prev) => !prev)}
          aria-label="댓글"
          className="cursor-pointer inline-flex gap-1 items-center"
        >
          <Image
            src="/icon/community/comment.svg"
            alt=""
            width={12}
            height={12}
            unoptimized
            priority={false}
          />
          <span className="text-sm">{replyCount}</span>
          <>
            <span className="block mx-1 bg-black rounded-full w-0.5 h-0.5" />
            <span className="text-xs text-text-secondary">
              {openReplies ? '숨기기' : '답글 보기'}
            </span>
          </>
        </button>
      </footer>

      {openReplies && (
        <div className="bg-secondary-100 w-11/12 ml-auto">
          <CommentEditor
            target={{ postId, parentCommentId: commentId }}
            onSubmit={handleSubmitReply}
            className="mx-2 mt-2"
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
