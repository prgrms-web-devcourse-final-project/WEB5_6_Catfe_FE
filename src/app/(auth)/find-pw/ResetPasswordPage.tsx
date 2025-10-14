"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import showToast from "@/utils/showToast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  resetPasswordWithToken,
  mapFindPwError,
  isApiError,
} from "@/api/findAuth";

function validatePassword(pw: string) {
  const okLength = pw.length >= 8;
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return okLength && hasNumber && hasSpecial;
}

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("token") ?? "", [sp]);
  const tokenMissing = !token;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm  = (form.elements.namedItem("confirm")  as HTMLInputElement).value;

    if (password !== confirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError("비밀번호는 최소 8자이며 숫자/특수문자를 포함해야 합니다.");
      setLoading(false);
      return;
    }
    if (tokenMissing) {
      setError("토큰 정보가 없습니다. 메일의 링크를 통해 다시 접속해주세요.");
      setLoading(false);
      return;
    }

    try {
      await resetPasswordWithToken({ token, newPassword: password });
      showToast("success", "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
      router.replace("/login");
    } catch (err: unknown) {
      setError(isApiError(err) ? mapFindPwError(err.code) : "비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-[364px] p-10 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">새 비밀번호를 입력해 주세요.</h2>
        {tokenMissing && (
          <div className="w-full text-sm text-error-600 text-center -mt-2">
            토큰이 없어 재설정을 진행할 수 없습니다. 비밀번호 찾기에서 다시 요청해주세요.
          </div>
        )}

        <div className="relative w-full h-[64px]">
          <label htmlFor="password" className="sr-only">비밀번호</label>
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            placeholder="Password"
            required
            autoComplete="new-password"
            className="w-full h-full pl-10 pr-10 border border-gray-400 rounded-md"
            disabled={loading}
          />
          <Image src="/icon/pwIcon.svg" alt="비밀번호" width={20} height={20} className="absolute left-3 top-1/2 -translate-y-1/2"/>
          <button
            type="button"
            onClick={() => setShowPw((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            <Image src={showPw ? "/icon/blind.svg" : "/icon/closed.svg"} alt="비밀번호 보기" width={20} height={20}/>
          </button>
        </div>

        <div className="relative w-full h-[64px]">
          <label htmlFor="confirm" className="sr-only">비밀번호 확인</label>
          <input
            id="confirm"
            name="confirm"
            type={showPwConfirm ? "text" : "password"}
            placeholder="Password Confirm"
            required
            autoComplete="new-password"
            className="w-full h-full pl-10 pr-10 border border-gray-400 rounded-md"
            disabled={loading}
          />
          <Image src="/icon/pwIcon.svg" alt="비밀번호 확인" width={20} height={20} className="absolute left-3 top-1/2 -translate-y-1/2"/>
          <button
            type="button"
            onClick={() => setShowPwConfirm((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={showPwConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            <Image src={showPwConfirm ? "/icon/blind.svg" : "/icon/closed.svg"} alt="비밀번호 보기" width={20} height={20}/>
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || tokenMissing}
          className="w-full h-[54px] bg-secondary-500 rounded-md font-semibold text-text-primary disabled:opacity-60"
        >
          {loading ? "변경 중..." : "변경하기"}
        </button>

        {error && <p className="text-xs text-error-600 text-center">{error}</p>}
        <p className="text-xs text-error-600 text-center">*변경 후 로그인 페이지로 이동합니다.</p>
      </form>
    </div>
  );
}
