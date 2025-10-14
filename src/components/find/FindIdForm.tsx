"use client";

import { useState } from "react";
import showToast from "@/utils/showToast";
import { requestUsernameRecover, isApiError, mapFindIdError } from "@/api/findAuth";

export default function FindIdForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();

    try {
      await requestUsernameRecover(email);
      showToast("success", "아이디를 이메일로 전송했습니다.");
      onSuccess(); // 모달 닫기
    } catch (err: unknown) {
      if (isApiError(err)) {
        setError(mapFindIdError(err.code));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("메일 발송에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-[364px] mx-auto">
      <label htmlFor="email" className="sr-only">이메일을 입력해 주세요</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full h-[64px] border border-gray-400 rounded-md px-4"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full h-[54px] bg-secondary-500 rounded-md font-semibold text-text-primary border-1 border-black disabled:opacity-60"
      >
        {loading ? "발송 중..." : "내 메일로 보내기"}
      </button>

      <p className="text-xs text-primary-500 text-center">
        *유저의 정보가 등록된 메일로 발송됩니다.
      </p>

      {error && <p className="text-xs text-error-600 text-center">{error}</p>}
    </form>
  );
}
