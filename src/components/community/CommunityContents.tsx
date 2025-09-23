'use client';

import { Post } from '@/@types/community';
import Image from 'next/image';
import TiptapRenderer from './TiptapRenderer';
import UserProfile from './UserProfile';

function CommunityContents({ post }: { post: Post }) {
  const {
    post_id: postId,
    title,
    author,
    content,
    categories = [],
    likeCount = 0,
    commentCount = 0,
    createdAt = '',
    updatedAt = '',
  } = post;

  return (
    <article className="flex flex-col gap-4 relative">
      <header className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* title & tags */}
        <h2 className="mr-3 text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          {categories &&
            categories.map((c, idx) => (
              <div
                key={`${postId}-category-${idx}`}
                className="px-2 py-1 border-0 bg-primary-500 rounded-sm text-background-white text-xs flex justify-center items-center"
              >
                {c}
              </div>
            ))}
        </div>
      </header>

      {/* button groups */}
      <div className="flex gap-4 items-center justify-center absolute top-0 right-0 sm:top-2 sm:right-2">
        <button
          onClick={() => console.log('즐겨찾기')}
          aria-label="즐겨찾기에 저장"
          className="cursor-pointer"
        >
          <Image
            src="/icon/community/heart.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
            priority={false}
          />
        </button>
        <button
          onClick={() => console.log('수정')}
          aria-label="게시글 수정"
          className="cursor-pointer"
        >
          <Image
            src="/icon/community/pencil.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
            priority={false}
          />
        </button>
        <button
          onClick={() => console.log('삭제')}
          aria-label="게시글 삭제"
          className="cursor-pointer"
        >
          <Image
            src="/icon/community/trash.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
            priority={false}
          />
        </button>
      </div>

      {/* user Profile */}
      <UserProfile author={author} createdAt={createdAt} updatedAt={updatedAt} />

      <hr />

      {/* TipTap Json Renderer */}
      <TiptapRenderer content={content} />

      <hr />

      {/* likes & comments */}
      <footer className="flex items-center gap-3">
        <button
          onClick={() => console.log('좋아요')}
          aria-label="좋아요"
          className="cursor-pointer"
        >
          <Image
            src="/icon/community/thumbs-up.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
            priority={false}
          />
        </button>
        <span>{likeCount}</span>
        <button onClick={() => console.log('댓글')} aria-label="댓글">
          <Image
            src="/icon/community/comment.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
            priority={false}
          />
        </button>
        <span>{commentCount}</span>
      </footer>
    </article>
  );
}
export default CommunityContents;
