'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import Link from 'next/link';
import FindModal from '@/components/find/FindModal';
import { login } from '@/api/auth';
import { useRouter } from 'next/navigation';
import { setAccessToken } from '@/utils/api';
import showToast from '@/utils/showToast';
import { useQueryClient } from '@tanstack/react-query';
import { userQueryKey } from '@/api/apiUsersMe';
import api from '@/utils/api';
import { AxiosError } from 'axios';

type ApiErrorBody = {
  success?: boolean;
  code?: string;
  message?: string;
  data?: unknown;
};

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPendingUser, setIsPendingUser] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSocialLogin = (provider: 'google' | 'naver' | 'kakao' | 'github') => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/${provider}`;
    window.location.href = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPendingUser(false);

    try {
      const { accessToken } = await login({ username: username.trim(), password });
      setAccessToken(accessToken);
      await queryClient.invalidateQueries({ queryKey: userQueryKey.me() });
      router.push('/');
    } catch (error) {
      const err = error as AxiosError<ApiErrorBody>;
      const status = err.response?.status;
      const code = err.response?.data?.code;
      const message = err.response?.data?.message ?? '';

      // ✅ 미인증 계정 (403 + USER_007)
      if (status === 403 && code === 'USER_007') {
        setIsPendingUser(true);
        showToast('error', message || '이메일 인증 후 로그인할 수 있습니다.');
        return;
      }

      if (status === 401) {
        showToast('error', '아이디/비밀번호를 확인하세요');
        return;
      }

      showToast('error', message || '로그인 중 오류가 발생했습니다.');
    }
  };

  const handleResendEmail = async () => {
    const email = resendEmail.trim();
    if (!email) {
      showToast('error', '인증 메일을 받을 이메일을 입력해 주세요.');
      return;
    }
    setResending(true);
    try {
      const res = await api.post('/api/auth/email/verify', { email });
      if (res.data?.success) {
        showToast('success', '인증 메일이 재전송되었습니다.');
        setIsPendingUser(false);
      } else {
        showToast('error', res.data?.message || '메일 재전송에 실패했습니다.');
      }
    } catch (error) {
      const err = error as AxiosError<ApiErrorBody>;
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 404) showToast('error', '존재하지 않는 사용자입니다.');
      else if (status === 409) showToast('info', '이미 인증된 계정입니다.');
      else if (status === 400) showToast('error', '잘못된 요청입니다. 이메일을 확인해 주세요.');
      else showToast('error', msg || '메일 전송 중 오류가 발생했습니다.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 w-full max-w-6xl">
        {/* 왼쪽 이미지 */}
        <div className="w-full max-w-[400px] lg:max-w-[600px] aspect-square relative">
          <Image
            src="/catmodum/catmakase_01.png"
            alt="고양이 픽셀"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="w-full max-w-[403px] flex flex-col gap-6">
          <h2 className="text-4xl lg:text-6xl font-semibold text-secondary-900 mb-5 text-center lg:text-left">
            Login
          </h2>
          <form className="flex flex-col gap-6 mt-2" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-[52px] lg:h-[64px] px-4 border border-black rounded-md"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[52px] lg:h-[64px] pr-10 pl-4 border border-black rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label={showPassword ? '비밀번호 가리기' : '비밀번호 보기'}
              >
                <Image
                  src={showPassword ? '/icon/closed.svg' : '/icon/blind.svg'}
                  alt={showPassword ? '비밀번호 가리기' : '비밀번호 보기'}
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
            {(['google', 'naver', 'github', 'kakao'] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-label={`${p} 로그인`}
                className="cursor-pointer"
                onClick={() => handleSocialLogin(p)}
              >
                <Image src={`/socialIcon/${p}.svg`} alt={p} width={36} height={36} />
              </button>
            ))}
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
          {isPendingUser && (
            <div className="flex flex-col items-center gap-2 mt-1">
              <p className="text-center text-sm text-secondary-800">
                이메일 인증이 완료되지 않았습니다.
              </p>
              <div className="flex w-full max-w-xs items-center gap-2">
                <input
                  type="email"
                  placeholder="가입한 이메일"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="flex-1 h-[30px] px-3 border border-black rounded-md"
                />
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="h-[30px] px-4 text-xs font-medium rounded-md bg-secondary-800 text-white flex items-center justify-center disabled:opacity-40"
                >
                  {resending ? '전송중…' : '전송'}
                </button>
              </div>
            </div>
          )}
          {isFindOpen && <FindModal onClose={() => setIsFindOpen(false)} />}
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
