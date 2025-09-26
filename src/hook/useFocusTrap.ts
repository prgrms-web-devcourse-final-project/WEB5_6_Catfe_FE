"use client";
import { useEffect, useRef } from "react";

export default function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const qs = 'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const focusables = root.querySelectorAll<HTMLElement>(qs);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); (last ?? first).focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); (first ?? last).focus(); }
    };
    document.addEventListener("keydown", onKey);
    (first ?? root).focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);
  return ref;
}