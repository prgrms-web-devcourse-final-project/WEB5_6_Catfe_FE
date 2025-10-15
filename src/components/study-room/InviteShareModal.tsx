"use client";

import { useId, useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";
import Button from "@/components/Button";
import showToast from "@/utils/showToast";

type Props = {
  inviteCode: string;
  inviteLink?: string | null;
  onClose?: () => void;
};

function InviteShareModal({ inviteCode, onClose }: Props) {
  const titleId = useId();
  const codeInputId = useId();
  const copyHelpId = useId();

  const inviteText = useMemo(() => {
    const lines = [
      "Catfé 스터디룸에 초대합니다 🙌",
      `초대 코드: ${inviteCode}`,
      `초대 코드 입력하러 가기 : https://catfe.com/study-rooms`,
    ];
    return lines.join("\n");
  }, [inviteCode]);

  const copy = async (text: string, okMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("success", okMsg);
    } catch {
      showToast("error", "클립보드 복사에 실패했어요.");
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

      <div className="flex flex-col gap-2">
        <label htmlFor={codeInputId} className="text-xs font-medium text-text-secondary">
          초대 코드
        </label>
        <div className={clsx("flex items-center justify-between rounded-lg border px-3 py-1.5 border-text-secondary")}>
          <input
            id={codeInputId}
            readOnly
            value={inviteCode ?? ""}
            className="w-full bg-transparent text-xs outline-none text-text-primary"
          />
          <button
            type="button"
            onClick={() => copy(inviteCode, "초대 코드가 복사되었습니다!")}
            className="shrink-0 p-1 rounded-full hover:bg-black/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            aria-label="초대 코드 복사"
            aria-describedby={copyHelpId}
            title="초대 코드 복사"
            disabled={!inviteCode?.trim()}
          >
            <Image src="/icon/study-room/copy.svg" alt="" width={16} height={16} />
          </button>
        </div>
        <p id={copyHelpId} className="sr-only">
          버튼을 누르면 초대 코드가 클립보드에 복사됩니다.
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        borderType="outline"
        color="primary"
        fullWidth
        onClick={() => copy(inviteText, "초대 정보가 복사되었습니다!")}
        aria-label="초대 정보 복사"
        title="초대 정보 복사"
        disabled={!inviteText.trim()}
      >
        초대 정보 복사하기
      </Button>
    </section>
  );
}

export default InviteShareModal;
