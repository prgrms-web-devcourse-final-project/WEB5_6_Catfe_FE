"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Image from "next/image";

type Option<V = string | number> = {
  label: string;
  value: V;
  disabled?: boolean;
  intent?: "default" | "danger";
};

type Props<V = string | number> = {
  value: V | null;
  onChange: (value: V, option: Option<V>) => void;
  options: Option<V>[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
  placement?: "auto" | "top" | "bottom";
  menuMaxHeight?: number;
  menuWidth?: number | "trigger";
};

export default function CustomSelect<V = string | number>({
  value,
  onChange,
  options,
  placeholder = "선택",
  className,
  size = "md",
  placement = "auto",
  menuMaxHeight = 240,
  menuWidth = "trigger",
}: Props<V>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<"top" | "bottom">("bottom");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listboxId = useId();

  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value]
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (placement === "auto") {
      const rect = triggerRef.current?.getBoundingClientRect();
      const spaceBelow = window.innerHeight - (rect?.bottom ?? 0);
      const needed = Math.min(menuMaxHeight, 240);
      setDirection(spaceBelow < needed ? "top" : "bottom");
    } else {
      setDirection(placement);
    }
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setTimeout(() => menuRef.current?.focus(), 0);
  }, [open, placement, selectedIndex, menuMaxHeight]);

  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (!open) return;
    if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowDown") {
      setActiveIndex((i) => {
        let next = Math.min(options.length - 1, (i < 0 ? -1 : i) + 1);
        while (options[next]?.disabled && next < options.length - 1) next++;
        return next;
      });
    }
    if (e.key === "ArrowUp") {
      setActiveIndex((i) => {
        let prev = Math.max(0, (i < 0 ? options.length : i) - 1);
        while (options[prev]?.disabled && prev > 0) prev--;
        return prev;
      });
    }
    if (e.key === "Home") setActiveIndex(0);
    if (e.key === "End") setActiveIndex(options.length - 1);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt && !opt.disabled) {
        onChange(opt.value as V, opt);
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
  };

  const pick = (idx: number) => {
    const opt = options[idx];
    if (!opt || opt.disabled) return;
    onChange(opt.value as V, opt);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const sizeClass =
    size === "sm"
      ? "h-7 px-2.5 text-xs rounded-lg"
      : "h-8 px-3 text-xs rounded-lg";

  const triggerText = selected?.label ?? placeholder;

  return (
    <div ref={wrapRef} className={clsx("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "min-w-[5.5rem] select-none border bg-background-white text-left outline-none",
          "border-text-secondary/60 hover:bg-gray-50",
          sizeClass,
          "relative pr-7",
          "cursor-pointer"
        )}
      >
        <span className={clsx("text-text-primary", !selected && "text-text-secondary")}>
          {triggerText}
        </span>
        <span
          className={clsx(
            "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 transition-transform",
            open ? (direction === "top" ? "-rotate-90" : "rotate-180") : "rotate-0"
          )}
        >
          <Image src="/icon/study-room/select.svg" alt="" width={16} height={16} />
        </span>
      </button>

      {open && (
        <ul
          ref={menuRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className={clsx(
            "absolute z-50 overflow-auto border bg-background-white shadow-lg focus:outline-none",
            "border-text-secondary/60 rounded-xl",
            direction === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
            "left-0"
          )}
          style={{
            maxHeight: menuMaxHeight,
            width:
              menuWidth === "trigger"
                ? triggerRef.current?.offsetWidth
                : typeof menuWidth === "number"
                ? menuWidth
                : undefined,
          }}
        >
          {options.map((opt, idx) => {
            const isSelected = idx === selectedIndex;
            const active = idx === activeIndex;
            const isDanger = opt.intent === "danger";
            return (
              <li key={String(opt.value)} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  disabled={opt.disabled}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => pick(idx)}
                  className={clsx(
                    "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs",
                    active && !isDanger && "bg-secondary-100",
                    isSelected && !isDanger && "bg-secondary-100",
                    isDanger ? "text-red-600 hover:bg-red-50" : "text-text-primary",
                    opt.disabled && "opacity-50 cursor-not-allowed",
                    !opt.disabled && "cursor-pointer"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && !isDanger && (
                    <Image src="/icon/study-room/check.svg" alt="" className="w-4 h-4" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
