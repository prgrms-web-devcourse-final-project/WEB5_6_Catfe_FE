"use client";

import { useState, useMemo, useId, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import Button from "@/components/Button";
import showToast from "@/utils/showToast";

type Props = {
  roomUrl: string;
  password?: string;
  defaultSharePassword?: boolean;
  onClose?: () => void;
};

function InviteShareModal({
  roomUrl,
  password,
  defaultSharePassword = true,
  onClose,
}: Props) {
  const [sharePw, setSharePw] = useState(() => !!password?.trim() && defaultSharePassword);

  const titleId = useId();
  const urlInputId = useId();
  const copyHelpId = useId();
  const sharePwId = useId();
  const hasPassword = !!password?.trim();

  useEffect(() => {
    if (!hasPassword) setSharePw(false);
  }, [hasPassword]);

  const inviteText = useMemo(() => {
    const lines = ["Catfé 스터디룸에 초대합니다 🙌", `링크: ${roomUrl}`];
    if (sharePw && password) lines.push(`비밀번호: ${password}`);
    return lines.join("\n");
  }, [roomUrl, password, sharePw]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("success", "링크가 복사되었습니다!");
    } catch {
      showToast("error", "링크 복사에 실패했습니다.");
    }
  };

  return (
    <section
      aria-labelledby={titleId}
      className="w-[40vw] max-w-[300px] rounded-2xl border border-text-secondary bg-background-white p-6 shadow-lg flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <h2 id={titleId} className="font-bold text-text-primary">
          스터디룸에 초대해 보세요
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            title="닫기"
            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded-md"
          >
            <Image src="/icon/study-room/close.svg" alt="" width={20} height={20} />
          </button>
        )}
      </div>

      {/* URL + 복사 버튼 */}
      <div className="flex flex-col gap-2">
        <label htmlFor={urlInputId} className="sr-only">
          스터디룸 링크
        </label>
        <div className={clsx("flex items-center justify-between rounded-lg border px-3 py-1.5 border-text-secondary")}>
          <input
            id={urlInputId}
            readOnly
            value={roomUrl}
            className="w-full bg-transparent text-xs outline-none text-text-primary"
          />
          <button
            type="button"
            onClick={() => copy(roomUrl)}
            className="shrink-0 p-1 rounded-full hover:bg-black/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            aria-label="링크 복사"
            aria-controls={urlInputId}
            aria-describedby={copyHelpId}
            title="링크 복사"
            disabled={!roomUrl}
          >
            <Image src="/icon/study-room/copy.svg" alt="" width={16} height={16} />
          </button>
        </div>
        <p id={copyHelpId} className="sr-only">
          버튼을 누르면 링크가 클립보드에 복사됩니다.
        </p>
      </div>

      {/* 비밀번호 공유 체크 */}
      {hasPassword && (
        <div className="flex items-center gap-2">
          <input
            id={sharePwId}
            type="checkbox"
            className="sr-only peer"
            checked={sharePw}
            onChange={(e) => setSharePw(e.target.checked)}
          />
          <label
            htmlFor={sharePwId}
            className={clsx(
              "grid place-items-center w-4 h-4 rounded-sm transition-colors cursor-pointer",
              sharePw ? "bg-primary-500" : "border border-text-secondary"
            )}
            aria-hidden="true"
          >
            {sharePw && (
              <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M4.5 10.5l3.2 3.2 7.8-7.8"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </label>
          <label htmlFor={sharePwId} className="text-xs font-medium text-text-primary cursor-pointer">
            비밀번호 공유
          </label>
        </div>
      )}

      <Button
        type="button"
        size="sm"
        borderType="solid"
        color="secondary"
        fullWidth
        onClick={() => copy(inviteText)}
        aria-label="초대 정보(링크와 선택 시 비밀번호)를 복사"
        title="초대 정보 복사"
      >
        초대 정보 복사하기
      </Button>
    </section>
  );
}

export default InviteShareModal;
