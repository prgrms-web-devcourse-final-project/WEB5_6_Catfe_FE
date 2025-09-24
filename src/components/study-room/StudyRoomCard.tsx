import React from "react";
import clsx from "clsx";
import Image from "next/image";

type Props = {
  title: string;
  description?: string;
  coverSrc?: string | null;
  isPrivate?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function StudyRoomCard({
  title,
  description,
  coverSrc,
  isPrivate = false,
  clickable = false,
  onClick,
  className,
}: Props) {
  return (
    <article
      className={clsx(
        "w-full overflow-hidden rounded-2xl border-2 border-text-secondary bg-background-white shadow-sm",
        clickable && "cursor-pointer hover:shadow-md active:translate-y-[1px]",
        className
      )}
      onClick={clickable ? onClick : undefined}
      aria-label={title}
    >
      {/* 상단: 썸네일 영역 */}
      <div className="relative">
        <div className="relative h-full w-full bg-secondary-500 sm:h-40">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt="썸네일 이미지"
              fill
              className="object-cover"
              sizes="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Image
                src="/icon/study-room/image-placeholder.svg"
                alt="이미지 없음 아이콘"
                width={40}
                height={40}
                draggable={false}
              />
            </div>
          )}
        </div>
        <div className="h-[2px] w-full bg-text-secondary" />
      </div>

      {/* 하단 정보 */}
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text-primary leading-tight line-clamp-1 text-xs">
            {title || "[roomName]"}
          </h3>
          {isPrivate && (
            <Image
              src="/icon/study-room/lock.svg"
              alt="비공개 스터디룸 아이콘"
              width={16}
              height={16}
              className="opacity-80"
            />
          )}
        </div>

        <p className="mt-2 text-[10px] text-text-secondary leading-snug line-clamp-1 min-h-[20px]">
          {description?.trim() || " "}
        </p>
      </div>
    </article>
  );
}