import Image from "next/image";
import React from "react";

type Props = {
  search?: string;
  sort?: "all" | "public" | "enter" | "popular";
};

export default function SearchBar({ search = "", sort = "all" }: Props) {
  return (
    <form method="get" className="mx-auto mt-10 mb-[200px] flex max-w-lg justify-center items-center gap-2">
      <div className="w-full h-auto max-w-[480px] px-4 py-2 flex justify-between rounded-2xl border-2 border-text-secondary focus-within:border-secondary-600">
        <input
          name="search"
          defaultValue={search}
          placeholder="스터디룸 검색"
          className="text-sm outline-none px-2"
        />
        <button className="p-2 hover:bg-text-secondary/20 cursor-pointer rounded-xl">
          <Image src="/icon/study-room/search.svg" alt="검색 아이콘" width={20} height={20} />
        </button>
      </div>
      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="page" value="1" />
    </form>
  );
}
