'use client';

import { ReplyComment } from '@/@types/community';
import { useState, memo } from 'react';
import UserProfile from './UserProfile';
import Image from 'next/image';
import LikeButton from '../LikeButton';

function CommentChildItem({ reply }: { reply: ReplyComment }) {
  const {
    author,
    content,
    likeCount: likeCountProp = 0,
    isLikedByMe = false,
    createdAt,
    updatedAt,
  } = reply;

  const [liked, setLiked] = useState<boolean>(isLikedByMe);
  const [likeCount, setLikeCount] = useState<number>(likeCountProp);

  // user 정보 붙이기 전 임시 코드
  const isAuthor = true;

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((c) => c + (liked ? -1 : 1));
  };

  return (
    <div className="rounded-lg w-full p-4 flex flex-col gap-3">
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
        <LikeButton liked={liked} count={likeCount} onToggle={toggleLike} iconSize={12} />
      </footer>
    </div>
  );
}
export default memo(CommentChildItem);
