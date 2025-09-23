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

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError(""); // 에러 초기화

    // 여기서 회원가입 로직 추가 (API 호출 등)
    console.log({ id, password, name, email });
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex gap-20 items-center">
        {/* 좌측 이미지 */}
        <div className="w-[600px] h-[600px] relative">
          <Image
            src="/catmodum/catmakase_02.png"
            alt="고양이 픽셀"
            fill
            className="object-contain"
          />
        </div>

        {/* 회원가입 폼 */}
        <div className="w-[403px] flex flex-col gap-6">
          <h1 className="text-[64px] font-semibold text-secondary-900 mb-5">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Image
                  src={showPassword ? "/icon/closed.svg" : "/icon/blind.svg"}
                  alt={showPassword ? "비밀번호 가리기" : "비밀번호 보기"}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Image
                  src={showPasswordConfirm ? "/icon/closed.svg" : "/icon/blind.svg"}
                  alt={showPasswordConfirm ? "비밀번호 가리기" : "비밀번호 보기"}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}

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
          </form>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
