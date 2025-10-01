// src/components/webrtc/PeerVideoGrid.tsx
"use client";
import VideoPlayer from './VideoPlayer';

export default function PeerVideoGrid({ streams }: { streams: { [userId: string]: MediaStream } }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(streams).map(([userId, stream]) => (
        <div key={userId} className="border rounded-xl p-2">
          <VideoPlayer stream={stream} />
          <p className="text-center text-sm mt-2">{userId}</p>
        </div>
      ))}
    </div>
  );
}
