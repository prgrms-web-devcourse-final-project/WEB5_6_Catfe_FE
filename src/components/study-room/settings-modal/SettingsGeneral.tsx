"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import RoomInfo, { RoomInfoValue } from "../RoomInfo";
import StudyRoomCard from "../StudyRoomCard";
import Button from "@/components/Button";

type Props = {
  defaultValue: RoomInfoValue;
  className?: string;
  onSave?: (changes: Partial<RoomInfoValue>, current: RoomInfoValue) => Promise<void> | void;
};

function isSame<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a instanceof File && b instanceof File) {
    return a.name === b.name && a.size === b.size && a.type === b.type;
  }
  return false;
}

function diffObject<T extends Record<string, unknown>>(prev: T, next: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key in next) {
    const k = key as keyof T;
    if (!isSame(prev[k], next[k])) {
      out[k] = next[k];
    }
  }
  return out;
}

export default function SettingsGeneral({
  defaultValue,
  className,
  onSave,
}: Props) {
  const [base, setBase] = useState<RoomInfoValue>(defaultValue);
  const [info, setInfo] = useState<RoomInfoValue>(defaultValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBase(defaultValue);
    setInfo(defaultValue);
  }, [defaultValue]);

  const changes = useMemo(() => diffObject(base, info), [base, info]);
  const isDirty = useMemo(() => Object.keys(changes).length > 0, [changes]);

  const handleSave = async () => {
    if (!isDirty || saving) return;
    try {
      setSaving(true);
      if (onSave) {
        await onSave(changes, info);
      } else {
        console.log("[SettingsGeneral] changes →", changes);
        console.log("[SettingsGeneral] current →", info);
      }
      setBase(info);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={clsx("flex flex-col justify-between w-full h-full", className)}>
      <div className="flex gap-10 w-full">
        {/* 좌측: 입력 영역 */}
        <div className="flex-1">
          <RoomInfo
            value={info}
            onChange={setInfo}
            mediaEnabled={!!info.mediaEnabled}
          />
        </div>

        {/* 우측: 미리보기 */}
        <aside className="w-[240px] shrink-0 sticky top-4 self-start">
          <div className="mb-2 text-xs font-semibold text-text-primary">미리보기</div>
          <StudyRoomCard
            title={info.title || "[roomName]"}
            description={info.description || "간단한 소개를 입력해주세요"}
            coverSrc={info.coverPreviewUrl ?? null}
            isPrivate={!!info.isPrivate}
            clickable={false}
          />
        </aside>
      </div>

      {/* 하단 오른쪽: 저장하기 */}
      <div className="flex justify-end">
        <Button
          size="md"
          borderType="solid"
          color="primary"
          disabled={!isDirty || saving}
          onClick={handleSave}
        >
          {saving ? "저장 중..." : isDirty ? "저장하기" : "변경 사항 없음"}
        </Button>
      </div>
    </div>
  );
}
