"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function HeroFlashlight() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [idle, setIdle] = useState(true);

  useLayoutEffect(() => {
    const sectionEl = sectionRef.current;
    const canvasEl = canvasRef.current;
    if (!sectionEl || !canvasEl) return;

    const section: HTMLElement = sectionEl;
    const canvas: HTMLCanvasElement = canvasEl;
    const _ctx = canvas.getContext("2d");
    if (!_ctx) return;
    const ctx: CanvasRenderingContext2D = _ctx;

    const target = { x: 0, y: 0 };
    const proxy = { x: 0, y: 0 };
    const light = { opacity: 0 };

    let tween: gsap.core.Tween | null = null;
    let flashlight = { center: 100, outside: 180 };
    const darknessAlpha = 0.9;

    const fit = () => {
      const rect = section.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const base = rect.height;
      flashlight = {
        center: Math.max(60, base / 5),
        outside: Math.max(120, base / 3),
      };

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      target.x = cx;
      target.y = cy;
      proxy.x = cx;
      proxy.y = cy;

      draw();
    };

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(section);
    fit();

    const getLocalXY = (clientX: number, clientY: number) => {
      const r = section.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };

    const setSpotImmediate = (x: number, y: number) => {
      tween?.kill();
      target.x = x;
      target.y = y;
      proxy.x = x;
      proxy.y = y;
      gsap.set(light, { opacity: 1 });
      setIdle(false);
      draw();
    };

    const fadeInLight = () => {
      setIdle(false);
      gsap.to(light, { opacity: 1, duration: 0.2, ease: "power2.out", onUpdate: draw });
    };

    const fadeOutLight = () => {
      setIdle(true);
      gsap.to(light, { opacity: 0, duration: 0.8, ease: "power2.out", onUpdate: draw });
    };

    const onEnter = (e: MouseEvent) => {
      const { x, y } = getLocalXY(e.clientX, e.clientY);
      setSpotImmediate(x, y);
    };

    const onMove = (e: MouseEvent) => {
      const { x, y } = getLocalXY(e.clientX, e.clientY);
      target.x = x;
      target.y = y;
      fadeInLight();
      animateProxy();
    };

    const onLeave = () => fadeOutLight();

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches?.length) return;
      const t = e.touches[0];
      const { x, y } = getLocalXY(t.clientX, t.clientY);
      setSpotImmediate(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches?.length) return;
      const t = e.touches[0];
      const { x, y } = getLocalXY(t.clientX, t.clientY);
      target.x = x;
      target.y = y;
      fadeInLight();
      animateProxy();
    };

    const animateProxy = () => {
      tween?.kill();
      tween = gsap.to(proxy, {
        x: target.x,
        y: target.y,
        duration: 0.25,
        ease: "power2.out",
        onUpdate: draw,
      });
    };

    function draw() {
      const r = section.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = darknessAlpha;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, r.width, r.height);
      ctx.globalAlpha = 1;

      const grad = ctx.createRadialGradient(
        proxy.x,
        proxy.y,
        flashlight.center,
        proxy.x,
        proxy.y,
        flashlight.outside
      );
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = light.opacity;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(proxy.x, proxy.y, flashlight.outside, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    section.addEventListener("touchstart", onTouchStart, { passive: true });
    section.addEventListener("touchmove", onTouchMove, { passive: true });
    section.addEventListener("touchend", onLeave);

    return () => {
      resizeObserver.disconnect();
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
      section.removeEventListener("touchstart", onTouchStart);
      section.removeEventListener("touchmove", onTouchMove);
      section.removeEventListener("touchend", onLeave);
      tween?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative w-full h-[60vh]
        bg-[url('/image/herosection-bg.png')]
        bg-no-repeat bg-cover bg-center
        overflow-hidden flex items-center justify-center
      "
    >
      <div
        className="
          relative z-0 
          text-[6vw] sm:text-[5vw] font-extrabold select-none
          text-text-primary/5 transition-all duration-300
          hover:text-primary-500 hover:drop-shadow-[0_0_50px_rgba(80,80,100,0.8)]
        "
      >
        고양이들의 온라인 스터디 카페
      </div>

      <div
        className={`
          absolute z-20 pointer-events-none
          text-[12vw] sm:text-[10vw] font-extrabold select-none
          text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.7)]
          transition-opacity duration-900
          ${idle ? "opacity-100" : "opacity-0"}
        `}
      >
        Catfé
      </div>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
      />
    </section>
  );
}
