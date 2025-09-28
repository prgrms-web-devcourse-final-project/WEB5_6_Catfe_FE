"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import useEscapeKey from "@/hook/useEscapeKey";
import UserProfileModal from "@/components/study-room/UserProfileModal";

type Props = {
  className?: string;
  onOpenSettings?: () => void;
  onOpenTimer?: () => void;
  onOpenNotice?: () => void;
  onOpenChat?: () => void;
  onOpenPlanner?: () => void;
  onOpenProfile?: () => void;
  onOpenUsers?: () => void;
  onOpenInvite?: () => void;
};

export default function Sidebar({
  className,
  onOpenSettings,
  onOpenTimer,
  onOpenNotice,
  onOpenChat,
  onOpenPlanner,
  onOpenProfile,
}: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  // ESC로 닫기
  useEscapeKey(profileOpen, () => setProfileOpen(false));

  // 바깥 클릭 닫기
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current && !anchorRef.current.contains(t)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileOpen]);

  const toggleProfile = () => {
    setProfileOpen((v) => !v);
    onOpenProfile?.();
  };

  return (
    <aside
      className={clsx(
        "h-screen w-[10vw] max-w-[70px] border-r border-black/10 flex flex-col items-center justify-between py-4 bg-background-white",
        className
      )}
      aria-label="Room sidebar"
    >
      {/* 상단 뒤로가기 아이콘 */}
      <button
        className="rounded-full p-2 cursor-pointer hover:bg-black/5"
        aria-label="뒤로가기"
        onClick={() => history.back()}
      >
        <Image src="/icon/study-room/exit.svg" alt="뒤로가기 아이콘" width={20} height={20} />
      </button>

      {/* 하단 아이콘들 */}
      <div className="flex flex-col items-center justify-center gap-4">
        <button className="rounded-full p-2 cursor-pointer hover:bg-black/5" aria-label="설정" onClick={onOpenSettings}>
          <Image src="/icon/study-room/settings.svg" alt="설정 아이콘" width={20} height={20} />
        </button>
        <button className="rounded-full p-2 cursor-pointer hover:bg-black/5" aria-label="타이머" onClick={onOpenTimer}>
          <Image src="/icon/study-room/clock.svg" alt="타이머 아이콘" width={20} height={20} />
        </button>
        <button className="rounded-full p-2 cursor-pointer hover:bg-black/5" aria-label="게시판" onClick={onOpenNotice}>
          <Image src="/icon/study-room/notice.svg" alt="게시판 아이콘" width={20} height={20} />
        </button>
        <button className="rounded-full p-2 cursor-pointer hover:bg-black/5" aria-label="채팅" onClick={onOpenChat}>
          <Image src="/icon/study-room/chat.svg" alt="채팅 아이콘" width={20} height={20} />
        </button>
        <button className="rounded-full p-2 cursor-pointer hover:bg-black/5" aria-label="플래너" onClick={onOpenPlanner}>
          <Image src="/icon/study-room/planner.svg" alt="플래너 아이콘" width={20} height={20} />
        </button>

        {/* 프로필 + 팝오버 */}
        <div className="relative" ref={anchorRef}>
          <button
            className="rounded-full cursor-pointer overflow-hidden w-7 h-7 ring-1 ring-text-secondary"
            aria-label="프로필"
            aria-haspopup="dialog"
            aria-expanded={profileOpen}
            onClick={toggleProfile}
          >
            <Image src="/image/cat.png" alt="내 프로필" width={28} height={28} />
          </button>

          {profileOpen && (
            <div className="absolute left-full ml-8 bottom-0 z-50">
              {/* 오른쪽으로, 버튼 하단선(bottom) 맞춰 출력 */}
              <UserProfileModal />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
