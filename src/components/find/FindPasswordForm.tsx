"use client";

import { useState } from "react";
import showToast from "@/utils/showToast";
import {
  requestPasswordRecover,
  mapFindPwError,
  isApiError,
} from "@/api/findAuth";

export default function FindPasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();

    try {
      await requestPasswordRecover(email);
      showToast("success", "비밀번호 재설정 메일이 발송되었습니다.");
      onSuccess(); 
    } catch (err: unknown) {
      setError(isApiError(err) ? mapFindPwError(err.code) : "메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-[364px] mx-auto">
      <label htmlFor="id" className="sr-only">아이디를 입력해 주세요</label>
      <input
        id="id"
        type="text"
        placeholder="ID"
        className="w-full h-[64px] border border-gray-400 rounded-md px-4"
      />

      <label htmlFor="email" className="sr-only">이메일을 입력해 주세요</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
        className="w-full h-[64px] border border-gray-400 rounded-md px-4"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full h-[54px] bg-secondary-400 rounded-md font-semibold text-text-primary border-1 border-black disabled:opacity-60"
      >
        {loading ? "발송 중..." : "비밀번호 재설정 메일 보내기"}
      </button>

      <p className="text-xs text-primary-500 text-center">
        *등록된 메일로 비밀번호 재설정 링크가 발송됩니다.
      </p>
      {error && <p className="text-xs text-error-600 text-center">{error}</p>}
    </form>
  );
}
