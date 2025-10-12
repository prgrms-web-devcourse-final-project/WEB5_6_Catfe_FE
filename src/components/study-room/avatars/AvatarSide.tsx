"use client";

import clsx from "clsx";

export type AvatarSideItem = {
  key: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

type AvatarSideProps = {
  items: AvatarSideItem[];
  value: string; // 현재 선택
  onChange: (key: string) => void; // 선택 변경
  className?: string;
  ariaLabel?: string;
};

export default function AvatarSide({
  items,
  value,
  onChange,
  className,
  ariaLabel = "아바타 카테고리",
}: AvatarSideProps) {

  return (
    <aside
      role="tablist"
      aria-label={ariaLabel}
      tabIndex={0}
      className={clsx(
        "w-48 shrink-0 pr-4",
        "pt-4 pb-6",
        className
      )}
    >
      <ul className="flex flex-col gap-5">
        {items.map((it) => {
          const selected = it.key === value;
          return (
            <li key={it.key}>
              <button
                role="tab"
                aria-selected={selected}
                disabled={it.disabled}
                onClick={() => !it.disabled && onChange(it.key)}
                className={clsx(
                  "group relative w-full text-left flex items-center gap-3",
                  "pl-6 pr-2 py-2 rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-primary-400",
                  it.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                  selected
                    ? "bg-primary-50 text-text-primary"
                    : "hover:bg-black/5 text-text-secondary"
                )}
              >
                {/* 왼쪽 표시 바 */}
                <span
                  aria-hidden
                  className={clsx(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-sm",
                    selected ? "bg-secondary-500" : ""
                  )}
                />
                <span className="font-semibold">{it.label}</span>
                {it.hint && (
                  <span className="sr-only">{it.hint}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
