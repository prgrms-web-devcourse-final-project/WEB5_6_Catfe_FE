'use client';
import VideoPlayer from './VideoPlayer';

export default function VideoNode({ stream }: { stream: MediaStream | null }) {
  if (!stream) return null;
  return <VideoPlayer stream={stream} />; 
}
