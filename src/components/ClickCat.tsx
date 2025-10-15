'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

export default function ClickCat() {
  const catRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const handleCatClick = () => {
    if (!catRef.current) return;

    gsap.killTweensOf(catRef.current);
    gsap.killTweensOf(bubbleRef.current);

    const tl = gsap.timeline();

    // 오뚜기 효과
    tl.to(catRef.current, {
      y: -20,
      rotation: 10,
      scale: 1.2,
      duration: 0.3,
      ease: 'power1.out',
    })
      .to(catRef.current, {
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.4)',
      });

    // 말풍선 효과 (뷰포트가 넓을 때만)
    if (typeof window !== 'undefined' && window.innerWidth > 640 && bubbleRef.current) {
      tl.to(
        bubbleRef.current,
        {
          opacity: 1,
          x: 12,
          duration: 0.3,
          ease: 'power1.out',
        },
        '<'
      ).to(bubbleRef.current, {
        delay: 0.8,
        opacity: 0,
        x: 30,
        duration: 0.5,
        ease: 'power1.inOut',
      });
    }
  };

  return (
    <div className="relative flex items-center justify-center w-[36px] h-[36px]">
      <div
        ref={catRef}
        onClick={handleCatClick}
        className="flex items-center justify-center"
      >
        <Image
          src="/image/crying-cat.svg"
          alt="Click Cat"
          width={40}
          height={40}
          className="object-contain"
        />
      </div>
      <div
        ref={bubbleRef}
        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0
                   bg-white border border-gray-400 rounded-full px-3 py-[2px]
                   text-xs font-medium shadow-sm z-10 pointer-events-none
                   whitespace-nowrap flex items-center gap-1"
      >
        이걸 왜눌러!
      </div>
    </div>
  );
}
