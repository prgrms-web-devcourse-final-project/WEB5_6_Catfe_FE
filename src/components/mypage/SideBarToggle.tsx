import Image from 'next/image';

function SideBarToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
      aria-expanded={!collapsed}
      className={[
        'absolute z-10 top-8 right-[-12px]',
        'inline-flex size-6 items-center justify-center rounded-full shadow ring-1 ring-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-secondary-400',
        'transition-transform duration-300',
        collapsed ? '' : 'rotate-180',
      ].join(' ')}
    >
      <Image src="/icon/rightChevron.svg" alt="" width={16} height={16} />
    </button>
  );
}
export default SideBarToggle;
