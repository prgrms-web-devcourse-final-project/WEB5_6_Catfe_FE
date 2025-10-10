'use client';
import Image from 'next/image';
import { memo } from 'react';

type Props = {
  name: string;
  avatarUrl?: string | null;
  // 영상이 있다면 WebRTCContainer에서 내려주는 비디오 노드 or stream
  video?: React.ReactNode;   
  muted?: boolean;        
  isMe?: boolean;
};

function UserTileBase({ name, avatarUrl, video, muted, isMe }: Props) {
  return (
    <div className="relative rounded-xl border bg-white overflow-hidden">
      <div className="aspect-video bg-black flex items-center justify-center">
        {video ? (
          // 영상 
          <div className="w-full h-full">{video}</div>
        ) : (
          // 프로필
          <div className="flex flex-col items-center justify-center text-white/80">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 mb-2">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={name} width={64} height={64} />
              ) : (
                <div className="w-full h-full bg-neutral-700" />
              )}
            </div>
            <span className="text-xs">{name}</span>
          </div>
        )}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white">
        {name} {isMe ? '(me)' : ''}
        {muted ? ' · muted' : ''}
      </div>
    </div>
  );
}
export default memo(UserTileBase);
