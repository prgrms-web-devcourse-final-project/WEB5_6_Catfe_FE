/* eslint-disable @next/next/no-img-element */

'use client';

import { PostListItem } from '@/@types/community';
import Button from '../Button';
import Link from 'next/link';

function PostCard({ post }: { post: PostListItem }) {
  if (!post || post.title.trim().length === 0) return null;
  const imgSrc = post.thumbnailUrl || '/image/community-thumbnail.png';

  return (
    <div className="flex flex-col rounded-lg border border-gray-400 max-w-[400px] max-h-[500px] overflow-hidden">
      {/* thumbnail */}
      <div className="w-full relative aspect-[2/1]">
        <img
          src={imgSrc as string}
          alt="게시글 썸네일"
          style={{
            objectFit: 'cover',
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          className="h-full w-full object-cover"
        />
      </div>
      {/* contents */}
      <div className="flex flex-1 flex-col gap-4 px-8 py-4">
        <div className="flex overflow-auto gap-1">
          {post.categories &&
            post.categories.map((category, idx) => (
              <span
                key={`${post.postId}-category-${idx}`}
                className="px-2 py-1 border-0 bg-secondary-500 rounded-sm text-text-secondary text-[10px] flex justify-center items-center whitespace-nowrap"
              >
                {category.name}
              </span>
            ))}
        </div>
        <h3 className="flex-1 line-clamp-2 text-base font-semibold overflow-ellipsis">
          {post.title}
        </h3>
        <Button size="sm" className="mx-auto">
          <Link href={`/community/${post.postId}`} scroll={true}>
            상세 내용 보기
          </Link>
        </Button>
      </div>
    </div>
  );
}
export default PostCard;
