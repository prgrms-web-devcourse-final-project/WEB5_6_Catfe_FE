'use client';

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import Link from "next/link";
import FindModal from "@/components/find/FindModal";
import { login } from "@/api/auth"; 
import { useRouter } from "next/navigation";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);


  const [username, setUsername] = useState("");   // 추가
  const [password, setPassword] = useState("");   // 추가
  const router = useRouter();
 
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const data = await login({ username, password });
    console.log("로그인 성공:", data);

    // 홈으로 이동
    router.push("/");
  } catch (err) {
    console.error("로그인 실패:", err);
    alert("아이디/비밀번호를 확인하세요");
  }
};

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex gap-20 items-center">
        <div className="w-[600px] h-[600px] relative">
          <Image
            src="/catmodum/catmakase_01.png"
            alt="고양이 픽셀"
            fill
            className="object-contain"
          />
        </div>
        <div className="w-[403px] flex flex-col gap-6">
          <h2 className="text-[64px] font-semibold text-secondary-900 mb-5">
            Login
          </h2>
          {/* 아이디 입력 */}
          <label htmlFor="login-id" className="sr-only">
            아이디
          </label>
          <input
            id="login-id"
            type="text"
            placeholder="ID"
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-[64px] px-4 border border-black rounded-md"
          />
          {/* 비밀번호 입력 */}
          <div className="relative">
            <label htmlFor="login-password" className="sr-only">
              비밀번호
            </label>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full h-[64px] pr-10 pl-4 border border-black rounded-md"
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
          <form className="flex flex-col gap-6 mt-2"
                onSubmit={handleSubmit}>
            <Button
              type="submit"
              size="lg"
              color="secondary"
              borderType="solid"
              fullWidth
              className="h-[54px] text-shadow-text-primary border border-solid border-amber-600"
            >
              Login
            </Button>
            <Link href="/register">
            <Button
              type="button"
              size="lg"
              color="secondary"
              borderType="solid"
              fullWidth
              className="h-[54px] text-shadow-text-primary border border-solid border-amber-600"
            >
              Register
            </Button>
            </Link>
          </form>
          {/* 소셜 로그인 */}
          <div className="flex justify-center gap-6 mt-2">
            <button type="button" aria-label="Google 로그인">
              <Image src="/socialIcon/google.svg" alt="" width={40} height={40} />
            </button>
            <button type="button" aria-label="naver 로그인">
              <Image src="/socialIcon/naver.svg" alt="" width={40} height={40} />
            </button>
            <button type="button" aria-label="github 로그인">
              <Image src="/socialIcon/git.svg" alt="" width={40} height={40} />
            </button>
            <button type="button" aria-label="facebook 로그인">
              <Image src="/socialIcon/facebook.svg" alt="" width={40} height={40} />
            </button>
            <button type="button" aria-label="kakao 로그인">
              <Image src="/socialIcon/kakao.svg" alt="" width={40} height={40} />
            </button>
          </div>
          <p className="text-center text-sm text-secondary-800 mt-4">
            <button 
            type="button" 
            onClick={() => setIsFindOpen(true)}
            className="underline text-secondary-900 hover:text-blue-800"
             >
              아이디/비밀번호 찾기
            </button>
          </p>
          {isFindOpen && <FindModal onClose={() => setIsFindOpen(false)} />}
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
