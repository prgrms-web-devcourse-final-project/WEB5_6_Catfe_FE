import Image from "next/image";


export default function HostBadge() {
  return (
    <div className="flex items-center gap-2 text-primary-500">
      <Image
        src="/icon/study-room/crown.svg"
        alt="owner"
        width={16}
        height={16}
        className="shrink-0"
      />
      <span className="text-sm font-semibold text-primary-500">소유자</span>
    </div>
  );
}