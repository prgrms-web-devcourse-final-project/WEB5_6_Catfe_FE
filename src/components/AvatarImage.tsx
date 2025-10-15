"use client";

import Image from "next/image";
import { getAvatarSrc, type AvatarId } from "@/utils/avatar";

type Props = {
  id: number | AvatarId | null | undefined;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  draggable?: boolean;
};

export default function AvatarImage({
  id,
  alt = "고양이 아바타",
  width = 40,
  height = 40,
  className,
  draggable = false,
}: Props) {
  const src = getAvatarSrc(id);
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      draggable={draggable}
    />
  );
}
