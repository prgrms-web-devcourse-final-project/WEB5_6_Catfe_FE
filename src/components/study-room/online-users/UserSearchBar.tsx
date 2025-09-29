import Image from "next/image";

export default function UsersSearchBar({
  value, onChange, onClear,
}: { value: string; onChange: (v: string) => void; onClear: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-xl border px-3 py-2 mb-3">
        <Image src="/icon/study-room/search.svg" alt="찾기 아이콘" height={20} width={20}/>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="사용자를 찾아 보세요"
          className="w-full bg-transparent outline-none text-xs placeholder:text-text-secondary"
        />
        {value && (
          <button onClick={onClear} aria-label="검색어 지우기" className=" text-text-primary cursor-pointer">
            <Image src="/icon/study-room/close.svg" alt="지우기 아이콘" height={20} width={20}/>
          </button>
        )}
      </div>
    </div>
  );
}