import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type MessageBubbleProps = React.PropsWithChildren<{
  mine?: boolean;
  nickname: string;
  profileImageUrl: string | null;
  timeString: string;
  clampPx?: number;
}>;

function MessageBubble({
  children,
  mine = false,
  nickname = 'GUEST',
  profileImageUrl = '',
  timeString,
  clampPx = 124,
}: MessageBubbleProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [needsClamp, setNeedsClamp] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const showSenderInfo = !mine;

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      setNeedsClamp(el.scrollHeight > clampPx + 4);
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [clampPx, children]);

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} gap-2`}>
      {/* 상대방일 경우 프로필 이미지 */}
      {showSenderInfo && (
        <div className="relative size-8">
          <Image
            src={profileImageUrl || '/image/cat-default.svg'}
            alt={nickname}
            fill
            className="rounded-full shrink-0 self-start"
            unoptimized
            priority={false}
          />
        </div>
      )}

      <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'} w-11/12`}>
        {/* 상대방일 경우 닉네임 */}
        {showSenderInfo && (
          <span className="text-xs font-semibold mb-1 text-gray-700">{nickname}</span>
        )}
        {/* 메시지 버블 + 시간 */}
        <div className={`flex ${mine ? 'flex-row-reverse' : 'flex-row'} items-end gap-1`}>
          <div
            className={[
              'relative rounded-2xl px-3 py-2 shadow-sm border  border-zinc-200',
              'max-w-3/4 break-words overflow-ellipsis',
              mine ? 'bg-primary-100' : 'bg-background-white',
              needsClamp && !expanded && 'pb-6',
            ].join(' ')}
          >
            <div
              ref={contentRef}
              className="text-sm text-text-primary"
              style={
                !needsClamp || expanded ? undefined : { maxHeight: clampPx, overflow: 'hidden' }
              }
            >
              {children}
            </div>
            {/* 접힌 상태에서 그라데이션 + 더보기 버튼 */}
            {needsClamp && !expanded && (
              <>
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent rounded-b-2xl flex justify-end ">
                  <button
                    type="button"
                    className="text-xs text-secondary-600 hover:text-secondary-800 cursor-pointer absolute bottom-2 right-2"
                    onClick={() => setExpanded(true)}
                  >
                    더보기
                  </button>
                </div>
              </>
            )}
            {/* 펼친 뒤 다시 접기 버튼 */}
            {needsClamp && expanded && (
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  className="text-xs text-secondary-600 hover:text-secondary-800 cursor-pointer"
                  onClick={() => setExpanded(false)}
                >
                  접기
                </button>
              </div>
            )}
          </div>
          {/* 시간 표시 */}
          <span className="text-[10px] text-zinc-500 whitespace-nowrap pb-1">{timeString}</span>
        </div>
      </div>
    </div>
  );
}
export default MessageBubble;
