import tw from '@/utils/tw';

function DateNavButton({
  dir,
  onClick,
  className = '',
}: {
  dir: 'prev' | 'next';
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? '이전 주' : '다음 주'}
      className={tw(
        'grid h-10 w-10 place-items-center rounded-lg border border-zinc-600/60 bg-secondary-50 hover:bg-secondary-100 cursor-pointer',
        className
      )}
    >
      {dir === 'prev' ? '◀︎' : '▶︎'}
    </button>
  );
}
export default DateNavButton;
