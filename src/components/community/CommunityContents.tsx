'use client';

import { Post } from '@/@types/community';
import { formatRelativeDate } from '@/utils/formatRelativeDate';
import Image from 'next/image';
import TiptapRenderer from './TiptapRenderer';

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
    <article className="flex flex-col gap-4">
      <header className="flex justify-between">
        {/* title & tags */}
        <div className="flex gap-4">
          <h2 className="mr-3 text-2xl font-bold">{title}</h2>
          {categories &&
            categories.map((c, idx) => (
              <div
                key={`${postId}-category-${idx}`}
                className="px-2 border-0 bg-primary-500 rounded-sm text-background-white text-xs flex justify-center items-center"
              >
                {c}
              </div>
            ))}
        </div>
        {/* button groups */}
        <div className="flex gap-2 items-center justify-center">
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
      </header>

      {/* user Profile */}
      <div className="flex gap-2 items-center">
        <div className="size-8 rounded-full border-2 border-gray-400 overflow-hidden">
          <Image
            src={author.profile_image_url ?? '/image/cat-default.svg'}
            alt={author.nickname}
            width={30}
            height={30}
          />
        </div>
        <span>{author.nickname}</span>
        <span className="block mx-1 bg-black rounded-full w-0.5 h-0.5" />
        {updatedAt ? (
          <span className="text-xs text-text-secondary">{formatRelativeDate(updatedAt)} 수정</span>
        ) : (
          <span className="text-xs text-text-secondary">{formatRelativeDate(createdAt)} 작성</span>
        )}
      </div>

      <hr />

      {/* TipTap Json Renderer */}
      <TiptapRenderer content={content} />

      <hr />
      <div className="flex items-center gap-3">
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
      </div>
    </article>
  );
}
export default CommunityContents;
