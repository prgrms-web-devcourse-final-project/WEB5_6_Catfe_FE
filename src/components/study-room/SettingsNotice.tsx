"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Toggle from "@/components/Toggle";
import Button from "@/components/Button";

export type NoticeValue = {
  newNotice: boolean;
  newMember: boolean;
};

type Props = {
  defaultValue: NoticeValue;
  className?: string;
  onSave?: (changes: Partial<NoticeValue>, current: NoticeValue) => Promise<void> | void;
};

function diffObject<T extends Record<string, unknown>>(prev: T, next: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key in next) {
    const k = key as keyof T;
    if (prev[k] !== next[k]) out[k] = next[k];
  }
  return out;
}

export default function SettingsNotice({ defaultValue, className, onSave }: Props) {
  const [base, setBase] = useState<NoticeValue>(defaultValue);
  const [info, setInfo] = useState<NoticeValue>(defaultValue);
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
        // API 미연결
        console.log("[SettingsNotice] PATCH payload:", changes);
        console.log("[SettingsNotice] current snapshot:", info);
      }
      setBase(info);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={clsx("flex flex-col gap-3 h-full justify-between", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-primary">새로운 공지</span>
          <Toggle
            checked={info.newNotice}
            onChange={(v) => setInfo((prev) => ({ ...prev, newNotice: v }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-primary">새로운 멤버 입장</span>
          <Toggle
            checked={info.newMember}
            onChange={(v) => setInfo((prev) => ({ ...prev, newMember: v }))}
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
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
