"use client";

import { useRef } from "react";
import clsx from "clsx";

import cat1 from "@/assets/cats/cat-1.svg";
import cat2 from "@/assets/cats/cat-2.svg";
import cat3 from "@/assets/cats/cat-3.svg";
import cat4 from "@/assets/cats/cat-4.svg";
import cat5 from "@/assets/cats/cat-5.svg";
import cat6 from "@/assets/cats/cat-6.svg";
import cat7 from "@/assets/cats/cat-7.svg";
import cat8 from "@/assets/cats/cat-8.svg";
import cat9 from "@/assets/cats/cat-9.svg";
import cat10 from "@/assets/cats/cat-10.svg";
import cat11 from "@/assets/cats/cat-11.svg";
import cat12 from "@/assets/cats/cat-12.svg";
import cat13 from "@/assets/cats/cat-13.svg";
import cat14 from "@/assets/cats/cat-14.svg";
import cat15 from "@/assets/cats/cat-15.svg";
import cat16 from "@/assets/cats/cat-16.svg";
import Image from "next/image";

export type AvatarId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

type Props = {
  value: AvatarId;   // 현재 선택된 아바타 번호(1~16)
  onChange: (id: AvatarId) => void; // 선택 변경
  onConfirm?: (id: AvatarId) => void;
  className?: string;
  ariaLabel?: string;
};

const IMAGES = [
  cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8,
  cat9, cat10, cat11, cat12, cat13, cat14, cat15, cat16,
] as const;

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
      {IMAGES.map((src, i) => {
        const id = (i + 1) as AvatarId;
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
