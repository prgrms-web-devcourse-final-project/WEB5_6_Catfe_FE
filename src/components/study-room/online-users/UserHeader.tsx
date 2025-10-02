import Image from "next/image";

export default function UsersHeader({
  titleId, onToggleSearch, onClose,
}: { titleId: string; onToggleSearch: () => void; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between pb-2 mb-3 border-b">
      <h2 id={titleId} className="font-bold">사용자 목록</h2>
      <div className="flex items-center gap-3">
        <button onClick={onToggleSearch} className="rounded-md hover:bg-gray-100 cursor-pointer" aria-label="검색창 토글">
          <Image src="/icon/study-room/search.svg" alt="찾기 아이콘" height={20} width={20}/>
        </button>
        <button onClick={onClose} className="rounded-md hover:bg-gray-100 cursor-pointer" aria-label="닫기">
          <Image src="/icon/study-room/close.svg" alt="지우기 아이콘" height={20} width={20}/>
        </button>
      </div>
    </div>
  );
}