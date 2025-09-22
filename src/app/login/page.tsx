'use client';

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex gap-20 items-center">
        {/* 왼쪽 고양이 이미지 */}
        <div className="w-[600px] h-[600px] relative">
          <Image
            src="/catmodum/catmakase_01.png"
            alt="고양이 픽셀"
            fill
            className="object-contain"
          />
        </div>

        {/* 오른쪽 로그인 폼 */}
        <div className="w-[403px] flex flex-col gap-6">
          {/* 타이틀 */}
          <h1 className="text-[64px] font-semibold text-secondary-900 mb-5">
            Login
          </h1>

          {/* 아이디 입력 */}
          <input
            type="text"
            placeholder="ID"
            className="w-full h-[64px] px-4 border border-gray-300 rounded-md"
          />

          {/* 비밀번호 입력 */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full h-[64px] pr-10 pl-4 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-label="비밀번호 보기 토글"
            >
              <Image
                src={showPassword ? "/icon/closed.svg" : "/icon/blind.svg"}
                alt={showPassword ? "비밀번호 가리기" : "비밀번호 보기"}
                width={20}
                height={20}
              />
            </button>
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-col gap-6 mt-2">
            <Button size="lg" color="secondary" borderType="solid" fullWidth
            className="h-[54px] text-shadow-text-primary border border-solid border-amber-600">
              Login
            </Button>
            <Button size="lg" color="secondary" borderType="solid" fullWidth
            className="h-[54px] text-shadow-text-primary border border-solid border-amber-600">
              Register
            </Button>
          </div>
          {/* 소셜 로그인 */}
          <div className="flex justify-center gap-6 mt-2">
            <Image src="/socialIcon/google.svg" alt="Google" width={40} height={40} />
            <Image src="/socialIcon/naver.svg" alt="Naver" width={40} height={40} />
            <Image src="/socialIcon/git.svg" alt="GitHub" width={40} height={40} />
            <Image src="/socialIcon/facebook.svg" alt="Facebook" width={40} height={40} />
            <Image src="/socialIcon/kakao.svg" alt="Kakao" width={40} height={40} />
          </div>

          {/* 아이디/비밀번호 찾기 */}
          <p className="text-center text-sm text-secondary-800  mt-4">
            아이디/비밀번호 찾기
          </p>          
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
