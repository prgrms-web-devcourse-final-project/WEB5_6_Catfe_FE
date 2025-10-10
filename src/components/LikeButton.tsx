'use client';

import Image from 'next/image';
import { useState } from 'react';

function LikeButton({
  liked = false,
  count = 0,
  iconSize = 12,
  onToggle,
}: {
  liked?: boolean;
  count?: number;
  iconSize?: number;
  onToggle?: (next: boolean) => void;
}) {
  const [animationKey, setAnimationKey] = useState(0);

  const handleClick = () => {
    const next = !liked;
    setAnimationKey((prev) => prev + 1);
    onToggle?.(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="좋아요"
      className="cursor-pointer inline-flex gap-1 items-center"
    >
      <span
        key={animationKey}
        className={[
          'inline-grid place-items-center',
          'animate-like-pop',
          'motion-reduce:animate-none',
        ].join(' ')}
      >
        <Image
          src={liked ? '/icon/community/thumbs-up-on.svg' : '/icon/community/thumbs-up.svg'}
          alt={liked ? '좋아요 취소' : '좋아요'}
          width={iconSize}
          height={iconSize}
          unoptimized
          priority={false}
        />
      </span>
      <span className="text-sm">{count}</span>{' '}
    </button>
  );
}
export default LikeButton;
