"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function UserHomeBanner() {
  const container = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>("[data-parallax='1']");

      layers.forEach((layer) => {
        const id = layer.dataset.id;
        if (id === "cat") gsap.set(layer, { yPercent: -15 });
        if (id === "chat") gsap.set(layer, { yPercent: -60 });
        if (id === "desk") gsap.set(layer, { yPercent: 5 });
        if (id === "wall") gsap.set(layer, { yPercent: 0 }); // 벽은 고정 느낌

        const depth = Number(layer.dataset.depth) || 0;
        gsap.to(layer, {
          y: depth * -40,
          ease: "none",
          scrollTrigger: {
            trigger: container.current,
            start: "20% bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // 채팅창만 살짝 위아래 움직임
      gsap.to("[data-id='chat']", {
        yPercent: "-=3",
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "sine.inOut",
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={container}
      className="relative overflow-hidden flex items-center justify-center"
    >
      <div className="relative h-80 w-[80vw] max-w-[470px] shrink-0">

        {/* 벽 (맨 뒤 배경) */}
        <div
          data-parallax="1"
          data-depth={-0.5}
          data-id="wall"
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image
            src="/image/banner-wall.svg"
            alt="벽"
            width={450}
            height={310}
            priority
          />
        </div>

        {/* 고양이 */}
        <div
          data-parallax="1"
          data-depth={-3}
          data-id="cat"
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image src="/image/banner-cats.svg" alt="고양이" width={290} height={141} priority />
        </div>

        {/* 채팅창 */}
        <div
          data-parallax="1"
          data-depth={-5}
          data-id="chat"
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image src="/image/banner-chat.svg" alt="채팅창" width={360} height={40} />
        </div>

        {/* 책상 */}
        <div
          data-parallax="1"
          data-depth={-1}
          data-id="desk"
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image src="/image/banner-desk.svg" alt="책상" width={390} height={104} />
        </div>

        {/* 프레임 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full">
          <Image
            src="/image/banner-screen.svg"
            alt="화면 프레임"
            width={117.5}
            height={80}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
