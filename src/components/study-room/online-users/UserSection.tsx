import Image from "next/image";

export default function UsersSection({
  title, collapsed, onToggle, children,
}: { title: string; collapsed: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <button onClick={onToggle} className="cursor-pointer" aria-label={`${title} 목록 접기/펼치기`}>
          <Image src="/icon/angle-small-down.svg" alt="목록 펼치기/접기 아이콘" height={20} width={20}  className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </header>
      {!collapsed && <ul className="mt-2 divide-y">{children}</ul>}
    </section>
  );
}