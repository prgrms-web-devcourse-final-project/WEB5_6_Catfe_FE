"use client";

import { useMemo, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import CustomSelect from "../CustomSelect";
import Button from "../Button";
import Image from "next/image";

export type RoomInfoValue = {
  title: string;
  description: string;
  maxParticipants: number;
  isPrivate: boolean;
  password: string | null;
  coverPreviewUrl: string | null;
  coverUploadFile?: File | null;
  mediaEnabled?: boolean;
};

type RoomInfoProps = {
  value: RoomInfoValue;
  onChange: (value: RoomInfoValue) => void;
  className?: string;
  mediaEnabled?: boolean;
};

function RoomInfo({
  value,
  onChange,
  className,
  mediaEnabled = false,
}: RoomInfoProps) {
  const TITLE_MAX = 15;
  const DESC_MAX = 30;

  // 최신 value를 보관해서 update가 안정적으로 참조
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // onChange만 의존하는 안정화된 업데이트 함수
  const update = useCallback((patch: Partial<RoomInfoValue>) => {
    onChange({ ...valueRef.current, ...patch });
  }, [onChange]);

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ title: e.target.value.slice(0, TITLE_MAX) });

  const onChangeDesc = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    update({ description: e.target.value.slice(0, DESC_MAX) });

  const fileRef = useRef<HTMLInputElement>(null);
  const onPickImage = () => fileRef.current?.click();

  const lastBlobUrlRef = useRef<string | null>(null);
  const revokeIfBlob = (url: string | null | undefined) => {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const allowedTypes = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/avif",
  ]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    const resetPicker = () => {
      e.currentTarget.value = "";
    };

    if (!f) {
      revokeIfBlob(lastBlobUrlRef.current);
      lastBlobUrlRef.current = null;
      update({ coverUploadFile: null, coverPreviewUrl: null });
      resetPicker();
      return;
    }

    if (!allowedTypes.has(f.type)) {
      alert("이미지 파일만 선택할 수 있어요. (png, jpg, webp, gif, svg, avif)");
      resetPicker();
      return;
    }

    revokeIfBlob(lastBlobUrlRef.current);
    const url = URL.createObjectURL(f);
    lastBlobUrlRef.current = url;
    update({ coverUploadFile: f, coverPreviewUrl: url });
    resetPicker();
  };

  useEffect(() => {
    return () => {
      revokeIfBlob(lastBlobUrlRef.current);
      lastBlobUrlRef.current = null;
    };
  }, []);

  const MAX_WITH_MEDIA = 4;
  const MAX_DEFAULT = 20;
  const maxCap = mediaEnabled ? MAX_WITH_MEDIA : MAX_DEFAULT;

  // 표시값도 즉시 클램프해서 UI 깜빡임 방지
  const clampedMaxParticipants = Math.min(value.maxParticipants, maxCap);

  // 실제 값이 cap을 초과하면 한 번만 교정
  useEffect(() => {
    if (value.maxParticipants > maxCap) {
      update({ maxParticipants: maxCap });
    }
  }, [maxCap, value.maxParticipants, update]);

  const members = useMemo(
    () => Array.from({ length: Math.max(0, maxCap - 1) }, (_, i) => i + 2),
    [maxCap]
  );

  return (
    <div className={clsx("w-full", className)}>
      <section className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-medium text-text-primary">
            <span>스터디룸 이름</span>
            <span className="text-text-secondary">
              {value.title.length} / {TITLE_MAX}
            </span>
          </label>
          <input
            value={value.title}
            onChange={onChangeTitle}
            placeholder="스터디룸 이름을 입력해주세요"
            className="w-full rounded-xl border text-[10px] border-text-secondary/60 bg-background-white px-3.5 py-2.5 outline-none focus:border-text-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-medium text-text-primary">
            <span>스터디룸 소개</span>
            <span className="text-text-secondary">
              {value.description.length} / {DESC_MAX}
            </span>
          </label>
          <textarea
            value={value.description}
            onChange={onChangeDesc}
            placeholder="간단한 소개를 입력해주세요"
            rows={3}
            className="w-full resize-none rounded-xl border border-text-secondary/60 bg-background-white px-3.5 py-2.5 outline-none focus:border-text-primary text-[10px]"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-xs text-text-primary">스터디룸 썸네일</span>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
              className="hidden"
              onChange={onFileChange}
            />
            <Button
              type="button"
              size="sm"
              borderType="solid"
              color="secondary"
              onClick={onPickImage}
              className="px-4 self-center hover:brightness-95 text-xs"
            >
              이미지 변경
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-text-primary text-xs">최대 인원</span>
          <CustomSelect
            value={clampedMaxParticipants}
            onChange={(v) => update({ maxParticipants: (v as number) ?? value.maxParticipants })}
            options={members.map((n) => ({ label: String(n), value: n }))}
            size="sm"
            placement="bottom"
            menuMaxHeight={220}
            menuWidth={88}
          />
        </div>

        {value.coverPreviewUrl ? (
          <Image
            width={640}
            height={280}
            src={value.coverPreviewUrl}
            alt="미리보기"
            className="mt-2 h-28 w-full rounded-md object-cover border"
          />
        ) : null}
      </section>
    </div>
  );
}

export default RoomInfo;
