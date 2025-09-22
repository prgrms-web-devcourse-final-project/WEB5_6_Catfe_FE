"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Toggle from "@/components/Toggle";

type Props = {
  defaultEnabled?: boolean;
  defaultPassword?: string;
  onChange?: (s: { enabled: boolean; password: string }) => void;
  className?: string;
};

function RoomPassword({
  defaultEnabled = false,
  defaultPassword = "",
  onChange,
  className,
}: Props) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [password, setPassword] = useState(defaultPassword);

  useEffect(() => {
    onChange?.({ enabled, password });
  }, [enabled, password, onChange]);

  return (
    <div className={clsx("w-full", className)}>
      <div className="flex w-full items-start justify-between">
        <div className="font-medium text-text-primary text-xs">비공개 여부</div>
        <Toggle checked={enabled} onChange={setEnabled} />
      </div>
      {enabled ? (
        <>
          <p className="mt-1 text-[10px] text-text-secondary">
                비공개의 경우, 비밀번호를 입력한 사용자만 스터디룸에 입장할 수 있습니다.
          </p>
        </>
      ) : ''}

      <div
        aria-hidden={!enabled}
        className={clsx("mt-3", enabled ? "visible" : "invisible")}
      >
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력해 주세요"
          className="w-full text-[10px] rounded-xl border border-text-secondary/60 bg-background-white px-3.5 py-2.5 text-text-primary outline-none"
          tabIndex={enabled ? 0 : -1}
          disabled={!enabled}
        />
      </div>
    </div>
  );
}
export default RoomPassword