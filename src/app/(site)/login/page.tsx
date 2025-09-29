'use client';

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import Link from "next/link";
import FindModal from "@/components/find/FindModal";
import { login } from "@/api/auth";
import { useRouter } from "next/navigation";
import { setAccessToken } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { accessToken, user } = await login({ username, password });
      setAccessToken(accessToken);
      setUser(user);
      router.push("/");
    } catch (err) {
      console.error("로그인 실패:", err);
      alert("아이디/비밀번호를 확인하세요");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 w-full max-w-6xl">
        <div className="w-full max-w-[400px] lg:max-w-[600px] aspect-square relative">
          <Image
            src="/catmodum/catmakase_01.png"
            alt="고양이 픽셀"
            fill
            className="object-contain"
          />
        </div>
        <div className="w-full max-w-[403px] flex flex-col gap-6">
          <h2 className="text-4xl lg:text-6xl font-semibold text-secondary-900 mb-5 text-center lg:text-left">
            Login
          </h2>

          <form className="flex flex-col gap-6 mt-2" onSubmit={handleSubmit}>
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
              className="w-full h-[52px] lg:h-[64px] px-4 border border-black rounded-md"
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
                className="w-full h-[52px] lg:h-[64px] pr-10 pl-4 border border-black rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label={showPassword ? "비밀번호 가리기" : "비밀번호 보기"}
              >
                <Image
                  src={showPassword ? "/icon/closed.svg" : "/icon/blind.svg"}
                  alt={showPassword ? "비밀번호 가리기" : "비밀번호 보기"}
                  width={20}
                  height={20}
                />
              </button>
            </div>
            <Button
              type="submit"
              size="lg"
              color="secondary"
              borderType="solid"
              fullWidth
              className="h-[48px] lg:h-[54px] text-shadow-text-primary border border-solid border-amber-600"
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
                className="h-[48px] lg:h-[54px] text-shadow-text-primary border border-solid border-amber-600"
              >
                Register
              </Button>
            </Link>
          </form>
          <div className="flex justify-center gap-4 lg:gap-6 mt-2">
            <button type="button" aria-label="Google 로그인">
              <Image src="/socialIcon/google.svg" alt="" width={36} height={36} />
            </button>
            <button type="button" aria-label="naver 로그인">
              <Image src="/socialIcon/naver.svg" alt="" width={36} height={36} />
            </button>
            <button type="button" aria-label="github 로그인">
              <Image src="/socialIcon/git.svg" alt="" width={36} height={36} />
            </button>
            <button type="button" aria-label="facebook 로그인">
              <Image src="/socialIcon/facebook.svg" alt="" width={36} height={36} />
            </button>
            <button type="button" aria-label="kakao 로그인">
              <Image src="/socialIcon/kakao.svg" alt="" width={36} height={36} />
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
