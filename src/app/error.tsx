'use client';

import Button from '@/components/Button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CatError from '@/assets/cats/cat-2.svg';
import { useEffect, useRef, useState } from 'react';

function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  /* 애니메이션 제어용 */
  const wrapRef = useRef<HTMLDivElement>(null);
  const [starsOn, setStarsOn] = useState(false);

  const onFallEnd = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 500);
    setStarsOn(true);
  };

  /* Error 확인 & 재시도 & 돌아가기 */
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  const handleClick = () => {
    if (document.referrer && document.referrer.startsWith(window.location.origin)) {
      // 사이트 안에서 이동한 경우 뒤로가기
      router.back();
    } else {
      // 직접 진입 or 외부 링크 진입 -> home으로
      router.push('/');
    }
  };

  return (
    <main className="h-dvh flex flex-col gap-6 items-center justify-center w-dvw max-w-[1200px] mx-auto">
      <div className="flex items-center text-center gap-3 sm:gap-1 w-3/4 h-50">
        <span className="inline-flex justify-center items-center w-1/2 h-full text-8xl sm:text-9xl font-bold text-warning-500">
          Oops!
        </span>
        <div className="w-1/2 h-2/3 relative inline-block select-none" ref={wrapRef}>
          <Image
            src={CatError}
            alt="넘어지는 고양이"
            fill
            draggable={false}
            onAnimationEnd={onFallEnd}
            className="w-full h-full object-contain cat-fall z-10"
          />
          <div className="absolute" style={{ left: '65%', bottom: '-10%' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="30"
              viewBox="0 0 64 40"
              aria-labelledby="title desc"
              role="img"
              style={{
                ['--rock-fill' as string]: '#8b8f9a',
                ['--rock-stroke' as string]: '#5e6169',
                ['--rock-shadow' as string]: '#00000020',
              }}
            >
              <ellipse cx="32" cy="34" rx="18" ry="4" fill="var(--rock-shadow)" />
              <path
                d="M12 26c0-9 7-16 18-16 7 0 10 2 13 4 5 4 9 8 9 12 0 7-7 10-20 10S12 33 12 26Z"
                fill="var(--rock-fill)"
                stroke="var(--rock-stroke)"
                stroke-width="1.5"
              />
              <path
                d="M22 22c2-3 6-5 12-5m-6 10c4 1 11 1 16-1"
                fill="none"
                stroke="#ffffff66"
                stroke-linecap="round"
              />
              <path
                d="M18 27c3 2 8 3 14 3m12-6c1 1 2 2 2 3"
                fill="none"
                stroke="var(--rock-stroke)"
                stroke-opacity=".4"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div className={`stars ${starsOn ? 'active' : ''}`} aria-hidden>
            <span className="star star--1">⭐️</span>
            <span className="star star--2">⭐️</span>
            <span className="star star--3">⭐️</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-3/4 items-center justify-center gap-5">
        <hr className="w-full" />
        <p className="text-center font-light text-text-secondary text-sm">
          페이지를 불러오는 중 문제가 생겼습니다.
          <br /> 다시 시도해주세요.
        </p>
        <div className="flex items-center gap-2 mx-auto">
          <Button
            borderType="solid"
            color="secondary"
            className="mx-auto"
            size="md"
            onClick={reset}
          >
            다시 시도하기
          </Button>
          <Button
            borderType="outline"
            color="secondary"
            className="mx-auto"
            size="md"
            onClick={handleClick}
          >
            돌아가기
          </Button>
        </div>
      </div>
    </main>
  );
}
export default GlobalError;
