import Image from "next/image";
import Link from "next/link";
import cat1 from "@/assets/cats/cat-5.svg"
import cat2 from "@/assets/cats/cat-15.svg"

type SortKey = "all" | "time" | "popular";

type Props = {
  search?: string;
  sort?: SortKey;
};

function buildQS(base: { search?: string; sort: SortKey; page: number }) {
  const p = new URLSearchParams();
  if (base.search?.trim()) p.set("search", base.search);
  p.set("sort", base.sort);
  p.set("page", String(base.page));
  return `?${p.toString()}`;
}

export default function FilterTabs({ search = "", sort = "all" }: Props) {
  const tabs: { key: SortKey; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "time", label: "시간순" },
    { key: "popular", label: "인기순" },
  ];

  return (
    <div className="mb-6 flex justify-between border-b-1 border-text-secondary">
      <div className="flex gap-3">
        {tabs.map((t) => {
          const active = sort === t.key;
          return (
            <Link
              key={t.key}
              href={buildQS({ search, sort: t.key, page: 1 })}
              className={`rounded-t-md px-5 py-2 h-auto ${
                active ? "bg-secondary-500" : "bg-secondary-300 hover:bg-secondary-500"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Image src={cat1} alt="고양이 이미지" width={40} height={60} />
        <Image src={cat2} alt="고양이 이미지" width={40} height={60} />
      </div>
    </div>
  );
}
