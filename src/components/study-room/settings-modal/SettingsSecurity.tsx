"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Button from "@/components/Button";
import RoomPassword from "../RoomPassword";

type SecurityValue = {
  isPrivate: boolean;
  password: string;
};

type Props = {
  defaultValue: SecurityValue;
  className?: string;
  onSave?: (changes: Partial<SecurityValue>, current: SecurityValue) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

function isSame<T>(a: T, b: T) {
  return a === b;
}
function diffObject<T extends Record<string, unknown>>(prev: T, next: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key in next) {
    const k = key as keyof T;
    if (!isSame(prev[k], next[k])) out[k] = next[k];
  }
  return out;
}

export default function SettingsSecurity({
  defaultValue,
  className,
  onSave,
  onDelete,
}: Props) {
  const [base, setBase] = useState<SecurityValue>(defaultValue);
  const [info, setInfo] = useState<SecurityValue>(defaultValue);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setBase(defaultValue);
    setInfo(defaultValue);
  }, [defaultValue]);

  const changes = useMemo(() => diffObject(base, info), [base, info]);
  const isDirty = useMemo(() => Object.keys(changes).length > 0, [changes]);

  const canSave = useMemo(() => {
    if (!isDirty) return false;
    if (!info.isPrivate) return true;
    return info.password.trim().length > 0;
  }, [isDirty, info.isPrivate, info.password]);

  const handleSave = async () => {
    if (!canSave || saving) return;
    try {
      setSaving(true);
      if (onSave) await onSave(changes, info);
      else {
        console.log("[SettingsSecurity] changes →", changes);
        console.log("[SettingsSecurity] current →", info);
      }
      setBase(info);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      if (onDelete) await onDelete();
      else console.log("[SettingsSecurity] delete room clicked");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={clsx("flex flex-col justify-between w-full h-full", className)}>
      {/* 상단 폼 */}
      <div>
        <RoomPassword
          className="mb-4"
          enabled={info.isPrivate}
          password={info.password ?? ""}
          onChange={(s) =>
            setInfo(prev => ({
              ...prev,
              isPrivate: s.enabled,
              password: s.password,
            }))
          }
        />
        <hr className="border-text-secondary/70 mb-3" />
        <Button
          type="button"
          size="sm"
          borderType="solid"
          color="primary"
          className="text-[10px]"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "삭제 중..." : "스터디룸 삭제"}
        </Button>
      </div>

      {/* 하단 우측 저장 버튼 */}
      <div className="flex justify-end pt-4">
        <Button
          size="md"
          borderType="solid"
          color="primary"
          disabled={!canSave || saving}
          onClick={handleSave}
        >
          {saving ? "저장 중..." : canSave ? "저장하기" : "변경 사항 없음"}
        </Button>
      </div>
    </div>
  );
}
