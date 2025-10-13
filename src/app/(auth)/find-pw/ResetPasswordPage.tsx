
"use client";

import { useState } from "react";
import Image from "next/image";
import showToast from "@/utils/showToast";
import { useRouter } from "next/navigation";


export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const router = useRouter();
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement)
      .value;

    if (password !== confirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("success", "비밀번호가 성공적으로 변경되었습니다."); 
      router.replace("/");
    } catch {
      setError("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6 w-[364px] p-10 rounded-lg"
      >
        <h2 className="text-lg font-semibold mb-4">
          새 비밀번호를 입력해 주세요.
        </h2>
        <div className="w-full h-[64px] flex items-center px-4 bg-red-100 rounded-md border border-gray-400 text-gray-700">
          User Id
        </div>
        <div className="relative w-full h-[64px]">
          <label htmlFor="password" className="sr-only">비밀번호</label>
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            placeholder="Password"
            required
            className="w-full h-full pl-10 pr-10 border border-gray-400 rounded-md"
          />
          <Image
            src="/icon/pwIcon.svg"
            alt="비밀번호"
            width={20}
            height={20}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <button
            type="button"
            onClick={() => setShowPw((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            <Image
              src={showPw ? "/icon/blind.svg" : "/icon/closed.svg"}
              alt="비밀번호 보기"
              width={20}
              height={20}
            />
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
            className="w-full h-full pl-10 pr-10 border border-gray-400 rounded-md"
          />
          <Image
            src="/icon/pwIcon.svg"
            alt="비밀번호 확인"
            width={20}
            height={20}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <button
            type="button"
            onClick={() => setShowPwConfirm((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            <Image
              src={showPwConfirm ? "/icon/blind.svg" : "/icon/closed.svg"}
              alt="비밀번호 보기"
              width={20}
              height={20}
            />
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[54px] bg-secondary-500 rounded-md font-semibold text-text-primary"
        >
          {loading ? "변경 중..." : "변경하기"}
        </button>
        {error && <p className="text-xs text-error-600 text-center">{error}</p>}
        <p className="text-xs text-error-600 text-center">
          *변경후 자동으로 로그인 됩니다.*
        </p>
      </form>
    </div>
  );
}
