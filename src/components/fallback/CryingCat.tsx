'use client';

import Image from 'next/image';

import tw from '@/utils/tw';

function CryingCat({ className }: { className?: string }) {
  return (
    <div
      className={tw(
        'w-1/3 h-2/3 relative select-none [--eye-left-x:29%] [--eye-left-y:38%] [--eye-right-x:55%] [--eye-right-y:38%] sm:[--eye-left-x:38%] sm:[--eye-left-y:34%] sm:[--eye-right-x:55%] sm:[--eye-right-y:34%] lg:[--eye-left-x:41%] lg:[--eye-left-y:35%] lg:[--eye-right-x:54%] lg:[--eye-right-y:35%] ',
        className
      )}
    >
      <Image
        src="/image/cat-default.svg"
        alt=""
        fill
        draggable={false}
        className="w-full h-full object-contain"
      />
      <TearFountain side="left" />
      <TearFountain side="right" />
      <div
        className="absolute left-1/2 translate-x-[-50%] pointer-events-none bottom-1 sm:bottom-[-2px] md:bottom-[-12px]"
        style={{
          width: '48%',
          maxWidth: 240,
        }}
      >
        <Puddle />
      </div>
    </div>
  );
}
export default CryingCat;

function TearFountain({ side }: { side: 'left' | 'right' }) {
  const xVar = side === 'left' ? '--eye-left-x' : '--eye-right-x';
  const yVar = side === 'left' ? '--eye-left-y' : '--eye-right-y';

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `var(${xVar}, 37%)`,
        top: `var(${yVar}, 33%)`,
        translate: '-50% 0%',
        width: 0,
        height: 0,
      }}
    >
      {[0, 1.6].map((delay, i) => (
        <span
          key={i}
          className="tear-drop"
          style={
            {
              ['--delay' as string]: `-${delay}s`,
              ['--dx' as string]: `${side === 'left' ? -8 : 8}px`,
              ['--spread' as string]: '16px',
              ['--fall' as string]: '95px',
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Puddle() {
  return (
    <div className="puddle">
      <span className="puddle-ring" />
      <span className="puddle-ring delay-300" />
    </div>
  );
}
