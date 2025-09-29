import { useEffect, useRef, useState } from 'react';

function MessageBubble({
  children,
  mine = false,
  clampPx = 124,
}: React.PropsWithChildren<{ mine?: boolean; clampPx?: number }>) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [needsClamp, setNeedsClamp] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

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
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
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
          style={!needsClamp || expanded ? undefined : { maxHeight: clampPx, overflow: 'hidden' }}
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
    </div>
  );
}
export default MessageBubble;
