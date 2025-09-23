"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");
    console.log({ id, password, name, email });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-5xl mx-auto flex-col md:flex-row items-center gap-10 md:gap-20">
        <div className="w-full max-w-[600px]">
          <Image
            src="/catmodum/catmakase_02.png"
            alt="고양이 픽셀"
            width={600}
            height={600}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <div className="w-full max-w-[403px] flex flex-col gap-6">
          <h1 className="text-[48px] md:text-[64px] font-semibold text-secondary-900 mb-5 text-center md:text-left">
            Register
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 아이디 */}
            <div className="relative">
              <input
                id="register-id"
                type="text"
                placeholder="ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full h-[64px] pl-10 pr-4 border border-black rounded-md"
              />
              <Image
                src="/icon/idIcon.svg"
                alt="아이디"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
            </div>
            {/* 비밀번호 */}
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[64px] pl-10 pr-10 border border-black rounded-md"
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
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="비밀번호 보기 토글"
              >
                <Image
                  src={showPassword ? "/icon/closed.svg" : "/icon/blind.svg"}
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
            </div>
            {/* 비밀번호 확인 */}
            <div className="relative">
              <input
                id="register-password-confirm"
                type={showPasswordConfirm ? "text" : "password"}
                placeholder="Password Confirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full h-[64px] pl-10 pr-10 border border-black rounded-md"
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
                onClick={() => setShowPasswordConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="비밀번호 확인 보기 토글"
              >
                <Image
                  src={showPasswordConfirm ? "/icon/closed.svg" : "/icon/blind.svg"}
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
            </div>
            {/* 이름 */}
            <div className="relative">
              <input
                id="register-name"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[64px] pl-10 pr-4 border border-black rounded-md"
              />
              <Image
                src="/icon/profile.svg"
                alt="이름"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
            </div>
            {/* 이메일 */}
            <div className="relative">
              <input
                id="register-email"
                type="email"
                placeholder="Email"
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
              />
            </div>
            {/* 버튼 */}
            <Button
              type="submit"
              size="lg"
              color="secondary"
              borderType="solid"
              fullWidth
              className="h-[54px] text-shadow-text-primary border border-solid border-amber-600"
            >
              Register
            </Button>
            {/* 에러 메시지: 버튼 바로 아래 */}
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
