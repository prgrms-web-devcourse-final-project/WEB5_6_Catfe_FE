"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Catfé | Register",
  description: "회원가입 페이지 - Catfé에서 새로운 계정을 만들어보세요.",
};


function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");

    setLoading(true);
  try {
    router.replace("/");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "회원가입 처리 중 오류가 발생했습니다. ";
    setError(msg);
    setLoading(false);
  }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-5xl mx-auto flex-col md:flex-row items-center gap-10 md:gap-20">
        <div className="w-full max-w-[600px]">
          <Image
            src="/catmodum/catmakase_02.png"
            alt="고양모둠"
            width={600}
            height={600}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <div className="w-full max-w-[403px] flex flex-col gap-6">
          <h2 className="text-[48px] md:text-[64px] font-semibold text-secondary-900 mb-5 text-center md:text-left">
            Register
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 아이디 */}
            <div className="relative">
              <label htmlFor="register-id" className="sr-only">
                아이디
              </label>
              <input
                id="register-id"
                type="text"
                placeholder="ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                className="w-full h-[64px] pl-10 pr-4 border border-black rounded-md"
              />
              <Image
                src="/icon/idIcon.svg"
                alt=""
                width={20}
                height={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
            {/* 비밀번호 */}
            <div className="relative">
              <label htmlFor="register-password" className="sr-only">
                비밀번호
              </label>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[64px] pl-10 pr-10 border border-black rounded-md"
                required
              />
              <Image
                src="/icon/pwIcon.svg"
                alt=""
                width={20}
                height={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="비밀번호 보기 토글"
              >
                <Image
                  src={showPassword ? "/icon/closed.svg" : "/icon/blind.svg"}
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </button>
            </div>
            {/* 비밀번호 확인 */}
            <div className="relative">
              <label htmlFor="register-password-confirm" className="sr-only">
                비밀번호 확인
              </label>
              <input
                id="register-password-confirm"
                type={showPasswordConfirm ? "text" : "password"}
                placeholder="Password Confirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full h-[64px] pl-10 pr-10 border border-black rounded-md"
                required
              />
              <Image
                src="/icon/pwIcon.svg"
                alt=""
                width={20}
                height={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="비밀번호 확인 보기 토글"
              >
                <Image
                  src={showPasswordConfirm ? "/icon/closed.svg" : "/icon/blind.svg"}
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </button>
            </div>
            {/* 이름 */}
            <div className="relative">
              <label htmlFor="register-name" className="sr-only">
                이름
              </label>
              <input
                id="register-name"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[64px] pl-10 pr-4 border border-black rounded-md"
                required
              />
              <Image
                src="/icon/profile.svg"
                alt="이름"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
            {/* 이메일 */}
            <div className="relative">
              <label htmlFor="register-email" className="sr-only">
                이메일
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[64px] pl-10 pr-4 border border-black rounded-md"
              />
              <Image
                src="/icon/idIcon.svg"
                alt="이메일"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              color="secondary"
              borderType="solid"
              fullWidth
              disabled={loading} 
              className="h-[54px] text-shadow-text-primary border border-solid border-amber-600"
            >
              {loading ? "Processing..." : "Register"}
            </Button>
            {error && (
              <p className="text-error-600 text-center text-sm mt-2" role="alert" aria-live="polite">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
