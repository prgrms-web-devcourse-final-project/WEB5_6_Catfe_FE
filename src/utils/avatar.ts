export type AvatarId =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export function toAvatarId(v: number | AvatarId | null | undefined): AvatarId {
  const n = Number(v ?? 1);
  const ok = Number.isInteger(n) && n >= 1 && n <= 16;
  return (ok ? n : 1) as AvatarId;
}

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

export const AVATAR_SRC = [
  cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8,
  cat9, cat10, cat11, cat12, cat13, cat14, cat15, cat16,
] as const;

export function getAvatarSrc(id: number | AvatarId | null | undefined) {
  const safe = toAvatarId(id);
  return AVATAR_SRC[safe - 1];
}
