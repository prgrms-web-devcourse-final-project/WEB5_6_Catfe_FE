"use client";
import { useEffect } from "react";

export default function useEscapeKey(enabled: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!enabled || !onClose) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, onClose]);
}