"use client";

import clsx from "clsx";
import Image from "next/image";
import { ReactNode, useMemo } from "react";
import type { AvatarId } from "@/utils/avatar";

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

const IMAGES = [cat1,cat2,cat3,cat4,cat5,cat6,cat7,cat8,cat9,cat10,cat11,cat12,cat13,cat14,cat15,cat16] as const;

type Props = {
  value: AvatarId | 1;
  className?: string;
  size?: number;
  title?: string;
  children?: ReactNode;
};

export default function AvatarPreview({
  value,
  className,
  size = 220,
  title,
  children,
}: Props) {
  const src = useMemo(() => (value ? IMAGES[value - 1] : null), [value]);

  return (
    <div className={clsx("flex flex-col bg-secondary-200", className)}>
      {title && (
        <div className="w-full px-4 pt-4 text-sm text-text-secondary">{title}</div>
      )}

      <div className="w-full flex-1 grid place-items-center p-6 sm:p-8 lg:p-10">
        {src ? (
          <Image
            src={src}
            alt={`선택 아바타 ${value}`}
            width={size}
            height={size}
            draggable={false}
            className="h-auto select-none [image-rendering:pixelated]
                       w-[clamp(88px,30%,240px)] sm:w-[clamp(96px,30%,256px)] lg:w-[clamp(112px,30%,272px)]"
            priority
          />
        ) : (
          <div className="text-text-secondary text-sm opacity-70">아바타를 선택해주세요</div>
        )}
      </div>

      {children && <div className="w-full px-6 pb-6">{children}</div>}
    </div>
  );
}
