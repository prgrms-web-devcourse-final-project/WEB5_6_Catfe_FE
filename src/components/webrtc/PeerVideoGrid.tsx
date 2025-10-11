"use client";

import VideoPlayer from "./VideoPlayer";

type StreamsMap = Record<string, MediaStream | null>;

export default function PeerVideoGrid({
  streams,
  maxCols = 2,
  emptyText = "참가자 입장을 기다리고 있어요…",
  className = "",
}: {
  streams: StreamsMap;         
  maxCols?: 1 | 2 | 3 | 4;
  emptyText?: string;
  className?: string;
}) {
  const entries = Object.entries(streams);

  const colClass =
    maxCols === 1
      ? "grid-cols-1"
      : maxCols === 2
      ? "sm:grid-cols-2"
      : maxCols === 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  if (entries.length === 0) {
    return (
      <div className={`rounded-xl border bg-white p-6 grid place-items-center ${className}`}>
        <p className="text-sm text-[var(--color-text-secondary)]">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${colClass} ${className}`}>
      {entries.map(([userId, stream]) => (
        <div key={userId} className="rounded-xl overflow-hidden border">
          <VideoPlayer stream={stream} muted={false} className="rounded-none border-0" />
          <p className="text-center text-[11px] text-[var(--color-text-secondary)] py-1">{userId}</p>
        </div>
      ))}
    </div>
  );
}
