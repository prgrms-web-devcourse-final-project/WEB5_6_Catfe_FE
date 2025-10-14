"use client";

export default function UserNameBadge({ name }: { name: string }) {
  return (
    <div className="pointer-events-none absolute right-3 bottom-3 z-20 max-w-[70%]" aria-hidden="true">
      <div
        className={[
          "rounded-md bg-black/45 backdrop-blur-[2px]",
          "border border-white shadow-[0_1px_6px_rgba(0,0,0,0.2)]",
          "px-2 py-[3px]",
        ].join(" ")}
        title={name}
      >
        <span className="block truncate text-[11px] leading-[1] font-medium text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.35)]">
          {name}
        </span>
      </div>
    </div>
  );
}