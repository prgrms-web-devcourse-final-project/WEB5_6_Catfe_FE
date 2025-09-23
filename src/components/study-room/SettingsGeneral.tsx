"use client";

import clsx from "clsx";
import RoomInfo, { RoomInfoValue } from "./RoomInfo";
import StudyRoomCard from "./StudyRoomCard";

type Props = {
  value: RoomInfoValue;
  onChange: (v: RoomInfoValue) => void;
  className?: string;
};

export default function SettingsGeneral({
  value,
  onChange,
  className,
}: Props) {
  return (
    <div className={clsx("flex gap-10 w-full", className)}>
      {/* 좌측: 입력 영역 */}
      <div className="flex-1">
        <RoomInfo
          defaultValue={value}
          onChange={onChange}
          mediaEnabled={value.mediaEnabled ?? false}
        />
      </div>

      {/* 우측: 미리보기 */}
      <aside className="w-[240px] shrink-0 sticky top-4">
        <div className="mb-2 text-xs font-semibold text-text-primary">미리보기</div>
        <StudyRoomCard
          title={value.title || "[roomName]"}
          description={value.description || "간단한 소개를 입력해주세요"}
          coverSrc={value.coverPreviewUrl}
          isPrivate={value.isPrivate}
          clickable={false}
        />
      </aside>
    </div>
  );
}
