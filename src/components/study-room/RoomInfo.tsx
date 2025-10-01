"use client";

import { useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import CustomSelect from "../CustomSelect";
import Button from "../Button";
import Image from "next/image";

export type RoomInfoValue = {
  title: string;
  description: string;
  maxMember: number;
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

  // 부모 value를 patch하여 올리는 헬퍼
  const update = (patch: Partial<RoomInfoValue>) => {
    onChange({ ...value, ...patch });
  };

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ title: e.target.value.slice(0, TITLE_MAX) });

  const onChangeDesc = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    update({ description: e.target.value.slice(0, DESC_MAX) });

  const fileRef = useRef<HTMLInputElement>(null);
  const onPickImage = () => fileRef.current?.click();

  // blob URL 관리(컴포넌트가 생성한 URL만 정리)
  const lastBlobUrlRef = useRef<string | null>(null);
  const revokeIfBlob = (url: string | null | undefined) => {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      // 이전 blob 정리
      revokeIfBlob(lastBlobUrlRef.current);
      lastBlobUrlRef.current = null;
      update({ coverUploadFile: null, coverPreviewUrl: null });
      return;
    }

    // 이전 blob 정리
    revokeIfBlob(lastBlobUrlRef.current);

    const url = URL.createObjectURL(f);
    lastBlobUrlRef.current = url;
    update({ coverUploadFile: f, coverPreviewUrl: url });
  };

  // 언마운트 시 blob 정리
  useEffect(() => {
    return () => {
      revokeIfBlob(lastBlobUrlRef.current);
      lastBlobUrlRef.current = null;
    };
  }, []);

  // 미디어 사용 시 최대 인원
  const MAX_WITH_MEDIA = 4;
  const MAX_DEFAULT = 20;
  const maxCap = mediaEnabled ? MAX_WITH_MEDIA : MAX_DEFAULT;

  // cap 초과 시 부모값 보정
  useEffect(() => {
    if (value.maxMember > maxCap) {
      update({ maxMember: maxCap });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxCap]);

  const members = useMemo(
    () => Array.from({ length: Math.max(0, maxCap - 1) }, (_, i) => i + 2),
    [maxCap]
  );

  return (
    <div className={clsx("w-full", className)}>
      <section className="flex flex-col gap-5">
        {/* 스터디룸 이름 */}
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

        {/* 스터디룸 소개 */}
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

        {/* 썸네일 변경 */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-xs text-text-primary">스터디룸 썸네일</span>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
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

        {/* 최대 인원 */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-text-primary text-xs">최대 인원</span>
          <CustomSelect
            value={value.maxMember}
            onChange={(v) => update({ maxMember: (v as number) ?? value.maxMember })}
            options={members.map((n) => ({ label: String(n), value: n }))}
            size="sm"
            placement="bottom"
            menuMaxHeight={220}
            menuWidth={88}
          />
        </div>

        {/* 미리보기 썸네일 (있으면) */}
        {value.coverPreviewUrl ? (
          <Image
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
