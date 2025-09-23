"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import Image from "next/image";

type MenuItem = {
  key: string;
  label: string;
  iconNon: string;
  iconAct: string;
  disabled?: boolean;
};

type Props = {
  items: MenuItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (key: string) => void;
  ariaLabel?: string;
  width?: number | string;
};

function ModalSideBar({
  items,
  value,
  defaultValue,
  onChange,
  ariaLabel = "사이드바 메뉴",
  width = 200,
}: Props) {
  const autoId = useId();
  const [internal, setInternal] = useState<string | undefined>(defaultValue ?? items[0]?.key);
  const selectedKey = value ?? internal;

  const handleSelect = (key: string, disabled?: boolean) => {
    if (disabled) return;
    if (value === undefined) setInternal(key);
    onChange?.(key);
  };


  return (
    <nav
      aria-label={ariaLabel}
      className={clsx(
        "shrink-0 bg-secondary-100 p-4 w-full",
      )}
      style={{ width }}
    >
      <ul
        role="listbox"
        aria-activedescendant={selectedKey ? `${autoId}-${selectedKey}` : undefined}
        className="flex flex-col gap-4"
      >
        {items.map(({ key, label, iconNon, iconAct, disabled}) => {
          const active = key === selectedKey;
          return (
            <li key={key}>
              <button
                id={`${autoId}-${key}`}
                role="option"
                aria-selected={active}
                disabled={disabled}
                onClick={() => handleSelect(key, disabled)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                  "transition-colors outline-none cursor-pointer",
                  "focus-visible:ring-1 focus-visible:ring-secondary-300",
                  active
                    ? "bg-secondary-400 text-text-primary"
                    : "hover:bg-secondary-200 text-text-secondary",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <Image src={active ? iconAct : iconNon} alt="메뉴 아이콘" className="inline-flex w-4 h-4 items-center justify-center" width={20} height={20}></Image>

                {/* 메뉴 이름 */}
                <span className="font-medium leading-none">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
export default ModalSideBar
