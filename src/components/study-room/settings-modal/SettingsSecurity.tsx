"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import clsx from "clsx";
import Button from "@/components/Button";
import RoomPassword from "../RoomPassword";
import Image from "next/image";
import showToast from "@/utils/showToast";
import { changeRoomPassword, deleteRoomPassword, setRoomPassword } from "@/api/apiRooms";
import { diffObject } from "@/utils/diffObject";
import { validatePassword } from "@/utils/validatePassword";

type SecurityValue = { isPrivate: boolean; password: string };

type Props = {
  roomId: number;
  defaultValue: SecurityValue;
  className?: string;
  onSave?: (changes: Partial<SecurityValue>, current: SecurityValue) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export default function SettingsSecurity({
  roomId,
  defaultValue,
  className,
  onSave,
  onDelete,
}: Props) {
  const [base, setBase] = useState(defaultValue);
  const [info, setInfo] = useState(defaultValue);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [showOld, setShowOld] = useState(false);

  useEffect(() => {
    setBase(defaultValue);
    setInfo(defaultValue);
    setOldPassword("");
    setShowOld(false);
  }, [defaultValue]);

  const showOldInput = base.isPrivate && info.isPrivate;
  useEffect(() => {
    if (!showOldInput) {
      setOldPassword("");
      setShowOld(false);
    }
  }, [showOldInput]);

  const changes = useMemo(() => diffObject(base, info), [base, info]);
  const isDirty = Object.keys(changes).length > 0;

  const violatesRule = useMemo(() => {
    if (!info.isPrivate) return false;
    return !validatePassword(info.password ?? "");
  }, [info.isPrivate, info.password]);

  const canSave = useMemo(() => {
    if (!isDirty) return false;
    const fromPrivate = base.isPrivate;
    const toPrivate = info.isPrivate;
    const newPwd = info.password.trim();
    const oldPwd = oldPassword.trim();

    if (!fromPrivate && toPrivate) return !violatesRule && !!newPwd;
    if (fromPrivate && toPrivate) return !violatesRule && !!(newPwd && oldPwd);
    if (fromPrivate && !toPrivate) return true;
    return false;
  }, [isDirty, base.isPrivate, info.isPrivate, info.password, oldPassword, violatesRule]);

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return;

    try {
      setSaving(true);
      const fromPrivate = base.isPrivate;
      const toPrivate = info.isPrivate;

      if (!fromPrivate && toPrivate) {
        const msg = await setRoomPassword(roomId, info.password.trim());
        setBase(info);
        if (onSave) await onSave(changes, info);
        showToast("success", msg || "비밀번호가 설정되었어요.");
        return;
      }

      if (fromPrivate && toPrivate) {
        const msg = await changeRoomPassword(roomId, oldPassword.trim(), info.password.trim());
        setBase(info);
        setOldPassword("");
        setShowOld(false);
        if (onSave) await onSave(changes, info);
        showToast("success", msg || "비밀번호가 변경되었어요.");
        return;
      }

      if (fromPrivate && !toPrivate) {
        const msg = await deleteRoomPassword(roomId);
        setBase({ isPrivate: false, password: "" });
        setInfo({ isPrivate: false, password: "" });
        setOldPassword("");
        setShowOld(false);
        if (onSave) await onSave({ isPrivate: false, password: "" }, { isPrivate: false, password: "" });
        showToast("success", msg || "공개방이 되었어요.");
        return;
      }

      showToast("info", "처리할 변경 사항이 없어요.");
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "요청 처리 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  }, [canSave, saving, base.isPrivate, info, oldPassword, roomId, onSave, changes]);

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      if (onDelete) await onDelete();
    } finally {
      setDeleting(false);
    }
  }, [deleting, onDelete]);

  return (
    <div className={clsx("flex flex-col justify-between w-full h-full", className)}>
      <div>
        <RoomPassword
          className="mb-4"
          enabled={info.isPrivate}
          password={info.password ?? ""}
          onChange={(s) => setInfo((prev) => ({ ...prev, isPrivate: s.enabled, password: s.password }))}
        />

        {showOldInput && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-text-primary mb-2">기존 비밀번호 입력</label>
            <div className="relative w-full">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="기존 비밀번호를 입력해 주세요"
                className="w-full text-[10px] rounded-xl border border-text-secondary/60 bg-background-white px-3.5 py-2.5 text-text-primary outline-none pr-9"
              />
              <button
                type="button"
                onClick={() => setShowOld((p) => !p)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                tabIndex={-1}
              >
                <Image
                  src={showOld ? "/icon/study-room/hide.svg" : "/icon/study-room/show.svg"}
                  alt={showOld ? "숨기기" : "보이기"}
                  width={14}
                  height={14}
                />
              </button>
            </div>
            {isDirty && (!oldPassword.trim() || !info.password.trim()) && (
              <p className="mt-1 text-[10px] text-red-500">기존/새 비밀번호를 모두 입력해 주세요.</p>
            )}
          </div>
        )}

        {info.isPrivate && violatesRule && (
          <p className="mt-2 text-[10px] text-red-500">비밀번호는 최소 8자이며, 영문과 숫자의 조합이어야 합니다.</p>
        )}

        <hr className="border-text-secondary/70 mb-3 mt-4" />

        <div className="flex justify-end">
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
      </div>

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
