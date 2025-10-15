"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import RoomInfo, { RoomInfoValue } from "../RoomInfo";
import StudyRoomCard from "../StudyRoomCard";
import Button from "@/components/Button";
import showToast from "@/utils/showToast";
import { updateRoom } from "@/api/apiRooms";
import { apiUploadFile } from "@/api/apiUploadFile";
import { UpdateRoomDto } from "@/@types/rooms";

type Props = {
  roomId: number;
  defaultValue: RoomInfoValue;
  currentParticipants?: number;
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
    if (!isSame(prev[k], next[k])) out[k] = next[k];
  }
  return out;
}

function toUpdateDtoAlways(
  current: RoomInfoValue,
  thumbnailAttachmentId?: number | null
): UpdateRoomDto {
  const maxP = Math.floor(Number(current.maxParticipants) || 0);
  const dto: UpdateRoomDto = {
    title: (current.title ?? "").trim(),
    description: (current.description ?? "").trim(),
    maxParticipants: maxP,
  };
  if (typeof thumbnailAttachmentId !== "undefined") {
    dto.thumbnailAttachmentId = thumbnailAttachmentId;
  }
  return dto;
}

export default function SettingsGeneral({
  roomId,
  defaultValue,
  currentParticipants,
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

    const title = (info.title ?? "").trim();
    if (!title) {
      showToast("warn", "방 제목을 입력해주세요.");
      return;
    }

    const maxP = Math.floor(Number(info.maxParticipants) || 0);
    if (!Number.isFinite(maxP) || maxP < 2) {
      showToast("warn", "최대 인원은 2명 이상으로 설정해주세요.");
      return;
    }

    const isMediaRoom = !!info.mediaEnabled;
    if (isMediaRoom && maxP > 4) {
      showToast("warn", "캠/보이스/화면공유 사용 방은 최대 4명까지만 설정할 수 있어요.");
      return;
    }

    const cur = Math.max(0, Number(currentParticipants || 0));
    if (maxP < cur) {
      showToast("warn", `현재 ${cur}명이 참가 중이에요. 최대 인원을 ${cur} 이상으로 설정해주세요.`);
      return;
    }

    setSaving(true);
    try {
      if (onSave) {
        await onSave(changes, info);
      }

      let thumbnailAttachmentId: number | null | undefined = undefined;
      const fileChanged =
        !!info.coverUploadFile && !isSame(base.coverUploadFile, info.coverUploadFile);
      const removedPreview =
        !!base.coverPreviewUrl && !info.coverPreviewUrl && !info.coverUploadFile;

      if (fileChanged) {
        const { attachmentId } = await apiUploadFile(info.coverUploadFile as File);
        thumbnailAttachmentId = attachmentId;
      } else if (removedPreview) {
        thumbnailAttachmentId = null;
      } else {
        thumbnailAttachmentId = undefined;
      }

      const dto = toUpdateDtoAlways(info, thumbnailAttachmentId);
      await updateRoom(roomId, dto, "put");

      showToast("success", "방 설정을 저장했어요!");
      setBase(info);
    } catch (err: unknown) {
      let message = "방 설정 변경에 실패했어요.";
      if (err instanceof Error) message = err.message || message;
      else if (typeof err === "string") message = err;
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={clsx("flex flex-col justify-between w-full h-full", className)}>
      <div className="flex gap-10 w-full">
        <div className="flex-1">
          <RoomInfo value={info} onChange={setInfo} mediaEnabled={!!info.mediaEnabled} />
        </div>
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
