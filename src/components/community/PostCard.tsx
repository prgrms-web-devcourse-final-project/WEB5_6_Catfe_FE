'use client';

import { PostListItem } from '@/@types/community';
import { extractPlainText, findFirstImage } from '@/utils/tiptapExtract';
import DefaultImage from '@/assets/community-thumbnail.png';
import Image from 'next/image';
import Button from '../Button';
import Link from 'next/link';

function PostCard({ post }: { post: PostListItem }) {
  if (!post || post.title.trim().length === 0) return null;

  const imgSrc = post.content ? findFirstImage(post.content) : DefaultImage;
  const snippet = post.content ? extractPlainText(post.content, 90) : '내용 미리보기 없음';

  return (
    <div className="flex flex-col rounded-lg border border-gray-400 max-w-[400px] max-h-[500px] overflow-hidden">
      {/* thumbnail */}
      <div className="w-full relative aspect-[2/1]">
        <Image
          src={imgSrc!}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          className="h-full w-full object-cover"
          priority={false}
        />
      </div>
      {/* contents */}
      <div className="flex flex-1 flex-col gap-4 px-8 py-4">
        <h3 className="line-clamp-1 text-base font-semibold overflow-ellipsis">{post.title}</h3>
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
        <p className="line-clamp-3 text-xs text-text-secondary flex-1">{snippet}</p>
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
