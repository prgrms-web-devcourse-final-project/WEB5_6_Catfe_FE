"use client";
import { IoIosMicOff } from "react-icons/io";

export default function MicOffBadge() {
  return (
    <div
      className="pointer-events-none absolute left-3 bottom-3 flex items-center
                 rounded-md text-[var(--color-error-500)] px-1.5 py-[2px]
                 shadow-md"
      title="마이크 꺼짐"
    >
      <IoIosMicOff className="mr-1" size={14} />
      <span className="text-[11px] font-medium"></span>
    </div>
  );
}
