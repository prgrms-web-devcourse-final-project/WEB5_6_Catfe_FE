"use client";

import { useRef } from "react";
import clsx from "clsx";
import Image from "next/image";
import { AVATAR_SRC, toAvatarId, type AvatarId } from "@/utils/avatar";

type Props = {
  value: AvatarId;
  onChange: (id: AvatarId) => void;
  onConfirm?: (id: AvatarId) => void;
  className?: string;
  ariaLabel?: string;
};

export default function AvatarSelect({
  value,
  onChange,
  onConfirm,
  className,
  ariaLabel = "아바타 선택",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      tabIndex={0}
      className={clsx(
        "outline-none",
        "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-2",
        className
      )}
    >
      {AVATAR_SRC.map((src, i) => {
        const id = toAvatarId(i + 1);
        const selected = id === value;

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`아바타 ${id}`}
            onClick={() => onChange(id)}
            onDoubleClick={() => onConfirm?.(id)}
            className={clsx(
              "relative aspect-square w-full rounded-xl border transition",
              "grid place-items-center",
              "cursor-pointer hover:scale-[1.03] active:scale-[0.98]",
              selected
                ? "ring-2 ring-primary-500 border-primary-500 shadow-[0_0_0_4px_rgba(0,0,0,0.08)]"
                : "border-black/10 hover:border-black/30"
            )}
          >
            <Image
              src={src}
              alt={`고양이 아바타 ${id}`}
              width={128}
              height={128}
              className="w-[72%] h-[72%] object-contain [image-rendering:pixelated]"
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
}
