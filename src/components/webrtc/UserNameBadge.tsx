"use client";

export default function UserNameBadge({ name }: { name: string }) {
  return (
    <div
      className={[
        "pointer-events-none absolute right-3 bottom-3",
        "z-20 rounded-md text-black border border-white",
        "px-2 py-[2px] shadow-md max-w-[70%]",
      ].join(" ")}
      title={name}
      aria-hidden="true"
    >
      <span className="block truncate text-[11px] leading-none font-medium">
        {name}
      </span>
    </div>
  );
}
