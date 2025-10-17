'use client';

import cat1 from '@/assets/cats/cat-1.svg';
import cat2 from '@/assets/cats/cat-2.svg';
import cat3 from '@/assets/cats/cat-3.svg';
import cat4 from '@/assets/cats/cat-4.svg';
import cat5 from '@/assets/cats/cat-5.svg';
import cat6 from '@/assets/cats/cat-6.svg';
import cat7 from '@/assets/cats/cat-7.svg';
import cat8 from '@/assets/cats/cat-8.svg';
import cat9 from '@/assets/cats/cat-9.svg';
import cat10 from '@/assets/cats/cat-10.svg';
import cat11 from '@/assets/cats/cat-11.svg';
import cat12 from '@/assets/cats/cat-12.svg';
import cat13 from '@/assets/cats/cat-13.svg';
import cat14 from '@/assets/cats/cat-14.svg';
import cat15 from '@/assets/cats/cat-15.svg';
import cat16 from '@/assets/cats/cat-16.svg';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const LOADING_THRESHOLD_MS = 2 * 60 * 1000;

export default function LoadingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    let timerId = null;
    timerId = setTimeout(() => {
      setIsTimeout(true);
    }, LOADING_THRESHOLD_MS);

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cats = [
      cat1,
      cat2,
      cat3,
      cat4,
      cat5,
      cat6,
      cat7,
      cat8,
      cat9,
      cat10,
      cat11,
      cat12,
      cat13,
      cat14,
      cat15,
      cat16,
    ] as const;
    const total = 25;
    const spawnGap = 0.35;
    const jitter = 0.25;
    const w = window.innerWidth;
    const h = window.innerHeight;

    gsap.set(container, { perspective: 600 });

    let spawned = 0;
    const created: HTMLImageElement[] = [];
    const timers: gsap.core.Tween[] = [];

    const spawn = () => {
      if (!container || spawned >= total) return;

      const img = document.createElement('img');
      const pick = cats[Math.floor(Math.random() * cats.length)];
      img.src = (pick as unknown as { src: string }).src;
      img.className = 'cat-dot';
      container.appendChild(img);
      created.push(img);
      spawned++;

      gsap.set(img, {
        position: 'absolute',
        top: 0,
        left: 0,
        x: gsap.utils.random(0, w),
        y: -60,
        z: gsap.utils.random(-200, 200),
        width: gsap.utils.random(40, 80),
        opacity: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        transformOrigin: 'center center',
      });

      gsap.to(img, { opacity: 1, duration: 0.25, ease: 'power1.out' });

      gsap.fromTo(
        img,
        { y: -60 },
        {
          y: h + 100,
          duration: gsap.utils.random(5, 10),
          ease: 'none',
          repeat: -1,
          onRepeat: () => {
            gsap.set(img, { x: gsap.utils.random(0, w), width: gsap.utils.random(40, 80) });
          },
        }
      );

      gsap.to(img, {
        duration: gsap.utils.random(4, 8),
        x: '+=100',
        rotationZ: gsap.utils.random(-30, 30),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(img, {
        duration: gsap.utils.random(3, 7),
        rotationX: gsap.utils.random(0, 360),
        rotationY: gsap.utils.random(0, 360),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: -5,
      });

      timers.push(gsap.delayedCall(spawnGap + gsap.utils.random(0, jitter), spawn));
    };

    spawn();

    return () => {
      timers.forEach((t) => t.kill());
      gsap.killTweensOf(created);
      created.forEach((el) => el.remove());
    };
  }, []);

  if (isTimeout) {
    router.push('/no-service');
  }

  return (
    <main className="bg-background-base">
      <style jsx>{`
        .cat-dot {
          position: absolute;
          pointer-events: none;
          user-select: none;
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={containerRef}
        className="relative w-screen h-screen overflow-hidden flex items-center justify-center"
      >
        <div className="absolute z-10 flex flex-col items-center">
          <Image src="/image/logo-light.svg" alt="Catfé logo" width={268} height={70} />
          <span className="text-3xl">Loading...</span>
        </div>
      </div>
    </main>
  );
}
