"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "../Button";
import AvatarModal from "@/components/study-room/avatars/AvatarModal";

function UserProfileModal() {
  const [avatarOpen, setAvatarOpen] = useState(false);

  const handleOpenAvatar = () => {
    setAvatarOpen(true);
  };

  return (
    <>
      {/* ✅ 프로필 모달 */}
      <div className="w-60 p-5 rounded-xl border border-text-secondary bg-background-white flex flex-col justify-center gap-3 shadow-md">
        {/* 유저 프로필 */}
        <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden">
          <Image src="/image/cat.png" alt="User Profile" width={40} height={40} />
        </div>
        <span className="font-semibold text-sm text-text-primary">[userName]</span>

        {/* 아바타 꾸미기 버튼 */}
        <Button
          size="sm"
          borderType="solid"
          color="secondary"
          hasIcon
          fullWidth
          onClick={handleOpenAvatar}
        >
          <Image src="/image/cat.png" alt="cat" width={16} height={16} />
          아바타 꾸미기
        </Button>
      </div>

      {/* AvatarModal */}
      <AvatarModal
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        onSave={(id:number) => {
          console.log("선택된 아바타:", id); // API 연동 후 삭제 예정
          setAvatarOpen(false);
        }}
      />
    </>
  );
}

export default UserProfileModal;
