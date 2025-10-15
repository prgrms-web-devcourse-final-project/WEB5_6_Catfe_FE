"use client";

import { useMemo, useState } from "react";
import BigModal from "@/components/study-room/BigModalLayout";
import AvatarSide, { AvatarSideItem } from "./AvatarSide";
import AvatarSelect, { AvatarId } from "./AvatarSelect";
import AvatarPreview from "./AvatarPreview";
import { updateMyAvatar } from "@/api/apiAvatars";
import showToast from "@/utils/showToast";

type Props = {
  open: boolean;
  onClose: () => void;
  roomId: number;
  initialAvatar?: AvatarId | null;
  onSave?: (id: AvatarId) => void;
  items?: AvatarSideItem[];
};

export default function AvatarModal({
  open,
  onClose,
  roomId,
  onSave,
  initialAvatar,
  items,
}: Props) {
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
  const [avatar, setAvatar] = useState<AvatarId>(initialAvatar ?? 1);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateMyAvatar(roomId, avatar);
      showToast("success", "아바타가 변경되었습니다 🐾");
      onSave?.(avatar);
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      showToast("error", e.message || "아바타 변경에 실패했어요.");
    } finally {
      setSaving(false);
    }
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
        <AvatarSide
          items={sideItems}
          value={selectedTab}
          onChange={setSelectedTab}
          className="w-[180px] px-2"
        />
        <div className="w-px bg-black/10 mx-6" aria-hidden />
        <div className="flex-1 px-2 py-4">
          <AvatarSelect
            value={avatar}
            onChange={setAvatar}
            onConfirm={setAvatar}
            className="max-w-[640px] mx-auto grid-cols-4 gap-6"
          />
        </div>
        <div className="w-[320px] shrink-0">
          <AvatarPreview
            value={avatar}
            title="미리보기"
            className="h-full rounded-none bg-secondary-200"
          >
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="w-full rounded-2xl py-3 text-base font-semibold
                         bg-amber-300/80 hover:bg-amber-300 text-amber-900
                         transition cursor-pointer disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </AvatarPreview>
        </div>
      </BigModal.Body>
    </BigModal>
  );
}
