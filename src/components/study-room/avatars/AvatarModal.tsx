"use client";

import { useMemo, useState } from "react";
import BigModal from "@/components/study-room/BigModalLayout";
import AvatarSide, { AvatarSideItem } from "./AvatarSide";
import AvatarSelect, { AvatarId } from "./AvatarSelect";
import AvatarPreview from "./AvatarPreview";

type Props = {
  open: boolean;
  onClose: () => void;
  /** 초기 아바타 (기본 1) */
  initialAvatar?: AvatarId;
  /** 저장 콜백 */
  onSave?: (id: AvatarId) => void;
  /** 사이드 탭 */
  items?: AvatarSideItem[];
};

export default function AvatarModal({
  open,
  onClose,
  onSave,
  initialAvatar = 1,
  items,
}: Props) {
  // 사이드 메뉴
  const sideItems = useMemo<AvatarSideItem[]>(
    () =>
      items ?? [
        { key: "fur", label: "털색", hint: "고양이 아바타의 털색을 바꿔요." },
        { key: "hat", label: "모자", disabled: true },
        { key: "clothes", label: "옷", disabled: true },
        { key: "shoes", label: "신발", disabled: true },
      ],
    [items]
  );
  const [selectedTab, setSelectedTab] = useState(sideItems[0]?.key ?? "fur");

  // 아바타 선택
  const [avatar, setAvatar] = useState<AvatarId>(initialAvatar);

  const handleSave = () => {
    onSave?.(avatar);
    onClose();
  };

  return (
    <BigModal
      open={open}
      onClose={onClose}
      title="아바타 꾸미기"
      titleId="avatar-modal-title"
      className="w-[980px] max-w-[98vw]"
    >
      <BigModal.Body className="flex min-h-[560px]">
        {/* 좌측: 사이드 탭 */}
        <AvatarSide
          items={sideItems}
          value={selectedTab}
          onChange={setSelectedTab}
          className="w-[180px] px-2"
        />

        {/* 사이드와 그리드 사이 구분선 */}
        <div className="w-px bg-black/10 mx-6" aria-hidden />

        {/* 중앙: 아바타 그리드 */}
        <div className="flex-1 px-2 py-4">
          <AvatarSelect
            value={avatar}
            onChange={setAvatar}
            onConfirm={setAvatar}
            className="max-w-[640px] mx-auto grid-cols-4 gap-6"
          />
        </div>

        {/* 우측: 프리뷰 패널 */}
        <div className="w-[320px] shrink-0">
          <AvatarPreview
            value={avatar}
            title="미리보기"
            className="h-full rounded-none bg-secondary-200"
          >
            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-2xl py-3 text-base font-semibold
                         bg-amber-300/80 hover:bg-amber-300 text-amber-900
                         transition cursor-pointer"
            >
              저장
            </button>
          </AvatarPreview>
        </div>
      </BigModal.Body>
    </BigModal>
  );
}
