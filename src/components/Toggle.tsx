"use client";

import clsx from "clsx";

type ToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
};

export default function Toggle({ checked, onChange, className }: ToggleProps) {
  const handleToggle = () => onChange(!checked);
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      onKeyDown={onKeyDown}
      className={clsx(
        "relative inline-flex items-center rounded-full px-[2px] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 cursor-pointer",
        "shrink-0",
        checked ? "bg-primary-500" : "bg-gray-300",
        className ?? "h-5 w-9"
      )}
    >
      <span
        className={clsx(
          "rounded-full bg-white shadow transition-all",
          "h-[calc(100%-4px)] aspect-square",
          checked ? "ml-auto" : "ml-0"
        )}
      />
    </button>
  );
}
