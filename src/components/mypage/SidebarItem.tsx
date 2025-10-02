import Image from 'next/image';
import Link from 'next/link';

interface NavItemProps {
  href: string;
  label: string;
  icon: string;
  activeIcon?: string;
  active?: boolean;
  collapsed?: boolean;
}

function SidebarItem({ href, label, icon, activeIcon, active, collapsed }: NavItemProps) {
  const iconSrc = active && activeIcon ? activeIcon : icon;
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={[
        'group relative flex items-center gap-3 px-3 py-3 my-3',
        active
          ? 'bg-primary-500 text-primary-50 shadow-sm'
          : 'text-text-secondary hover:bg-secondary-300',
        'focus:outline-none focus:ring-2 focus:ring-secondary-400',
        collapsed ? 'rounded-full justify-center mx-3' : 'rounded-xl mx-2',
      ].join(' ')}
    >
      <Image src={iconSrc} alt="" width={20} height={20} aria-hidden />
      <span className={collapsed ? 'sr-only' : 'text-sm font-medium'}>{label}</span>
    </Link>
  );
}
export default SidebarItem;
