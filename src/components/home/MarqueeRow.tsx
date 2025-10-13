"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import type { StaticImageData } from "next/image";

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

const SOURCES: ImgSrc[] = [
  cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8,
  cat9, cat10, cat11, cat12, cat13, cat14, cat15, cat16,
];

const SPEED = 120;
const GAP = 40;
const REPEAT = 3;
const ITEM_SIZE = 40;

export default function MarqueeRow({ direction = "rtl" }: { direction?: Direction }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const aRef = useRef<HTMLDivElement | null>(null);
  const bRef = useRef<HTMLDivElement | null>(null);

  const longItems = useMemo(() => {
    const arr: ImgSrc[] = [];
    for (let i = 0; i < Math.max(1, REPEAT); i++) arr.push(...SOURCES);
    return arr;
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const a = aRef.current;
    const b = bRef.current;
    if (!track || !a || !b) return;

    const faces = track.querySelectorAll<HTMLImageElement>(".cat-face");
    gsap.set(faces, {
      scaleX: direction === "rtl" ? 1 : -1,
      transformOrigin: "50% 50%",
      force3D: true,
      willChange: "transform",
      display: "block",
    });

    const wraps = track.querySelectorAll<HTMLDivElement>(".cat-wrap");
    gsap.to(wraps, {
      y: -10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      duration: 0.6,
    });

    const state = { x: 0 };
    let w = a.getBoundingClientRect().width;

    const place = () => {
      w = Math.max(1, Math.round(a.getBoundingClientRect().width));
      gsap.set(a, { x: 0, force3D: true, willChange: "transform" });
      gsap.set(b, { x: direction === "rtl" ? w : -w, force3D: true, willChange: "transform" });
    };

    const play = () => {
      place();
      const dur = w / Math.max(1, SPEED);
      gsap.killTweensOf(state);
      gsap.to(state, {
        x: `+=${w}`,
        duration: Math.max(0.0001, dur),
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
    ro.observe(a);
    ro.observe(track);

    return () => {
      gsap.killTweensOf(state);
      gsap.killTweensOf(wraps);
      ro.disconnect();
    };
  }, [direction]);

  const pad = Math.round(GAP / 2);

  return (
    <div ref={trackRef} className="relative w-full h-15 overflow-hidden select-none">
      <div
        ref={aRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-end"
        style={{ gap: GAP, paddingLeft: pad, paddingRight: pad }}
      >
        {longItems.map((src, i) => (
          <div
            key={`a-${i}`}
            className="cat-wrap"
            style={{ width: ITEM_SIZE, height: ITEM_SIZE, display: "grid", placeItems: "center" }}
          >
            <Image
              src={src}
              alt={`cat-${i + 1}`}
              width={ITEM_SIZE}
              height={ITEM_SIZE}
              className="cat-face"
              style={{ width: ITEM_SIZE, height: ITEM_SIZE, maxWidth: "none", display: "block" }}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div
        ref={bRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-end"
        style={{ gap: GAP, paddingLeft: pad, paddingRight: pad }}
      >
        {longItems.map((src, i) => (
          <div
            key={`b-${i}`}
            className="cat-wrap"
            style={{ width: ITEM_SIZE, height: ITEM_SIZE, display: "grid", placeItems: "center" }}
          >
            <Image
              src={src}
              alt={`cat-${i + 1}`}
              width={ITEM_SIZE}
              height={ITEM_SIZE}
              className="cat-face"
              style={{ width: ITEM_SIZE, height: ITEM_SIZE, maxWidth: "none", display: "block" }}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
