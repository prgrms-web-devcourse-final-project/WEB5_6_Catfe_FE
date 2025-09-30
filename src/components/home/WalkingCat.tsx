"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import Image, { type StaticImageData } from "next/image";

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

type Direction = "rtl" | "ltr";
type ImgSrc = StaticImageData | string;

type MarqueeRowProps = {
  items: ImgSrc[];
  direction?: Direction;
  speed?: number;
  gap?: number;
};

function MarqueeRow({ items, direction = "rtl", speed = 120 }: MarqueeRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const aRef = useRef<HTMLDivElement | null>(null);
  const bRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const a = aRef.current;
    const b = bRef.current;
    if (!track || !a || !b) return;

    // 이미지 좌우 반전
    const faces = track.querySelectorAll<HTMLImageElement>(".cat-face");
    gsap.set(faces, {
      scaleX: direction === "rtl" ? 1 : -1,
      transformOrigin: "50% 50%",
      force3D: true,
    });

    // 살짝 위아래 튕김
    const wraps = track.querySelectorAll<HTMLDivElement>(".cat-wrap");
    gsap.to(wraps, {
      y: -10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      duration: 0.6,
      stagger: 0,
    });

    const state = { x: 0 };
    let w = a.offsetWidth;

    const place = () => {
      w = a.offsetWidth;
      gsap.set(a, { x: 0, force3D: true });
      gsap.set(b, { x: direction === "rtl" ? w : -w, force3D: true });
    };

    const play = () => {
      place();
      const dur = w / speed;
      gsap.killTweensOf(state);
      gsap.to(state, {
        x: `+=${w}`,
        duration: dur,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          const t = state.x % w;
          if (direction === "rtl") {
            gsap.set(a, { x: -t, autoRound: false });
            gsap.set(b, { x: -t + w, autoRound: false });
          } else {
            gsap.set(a, { x: t, autoRound: false });
            gsap.set(b, { x: t - w, autoRound: false });
          }
        },
      });
    };

    play();
    const ro = new ResizeObserver(() => play());
    ro.observe(track);

    return () => {
      gsap.killTweensOf(state);
      ro.disconnect();
      gsap.killTweensOf(wraps);
    };
  }, [direction, speed]);

  return (
    <div ref={trackRef} className="relative w-full h-16 overflow-hidden select-none">
      {/* 블록 A */}
      <div
        ref={aRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-end px-2 gap-4"
      >
        {items.map((src, i) => (
          <div key={`a-${i}`} className="cat-wrap">
            <Image
              src={src}
              alt={`cat-${i + 1}`}
              width={40}
              height={40}
              className="cat-face"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* 블록 B (동일 콘텐츠) */}
      <div
        ref={bRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-end px-2 gap-4"
      >
        {items.map((src, i) => (
          <div key={`b-${i}`} className="cat-wrap">
            <Image
              src={src}
              alt={`cat-${i + 1}`}
              width={40}
              height={40}
              className="cat-face"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WalkingCat() {
  const sources: ImgSrc[] = [
    cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8,
    cat9, cat10, cat11, cat12, cat13, cat14, cat15, cat16,
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 위 줄: 오른쪽 → 왼쪽 */}
      <MarqueeRow items={sources} direction="ltr" speed={120} />
      <h1 className="text-6xl font-bold tracking-wide text-center py-5">catfé</h1>
      {/* 아래 줄: 왼쪽 → 오른쪽 */}
      <MarqueeRow items={sources} direction="rtl" speed={120} />
    </div>
  );
}
