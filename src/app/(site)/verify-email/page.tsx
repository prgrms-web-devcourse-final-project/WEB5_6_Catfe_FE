'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import type { AxiosError } from 'axios';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('잘못된 접근입니다. (토큰 누락)');
        return;
      }

      try {
        const res = await api.get(`/api/auth/email/verify?token=${token}`);
        if (res.data.success) {
          setStatus('success');
          setMessage('이메일 인증이 완료되었습니다!');
          setTimeout(() => router.replace('/login'), 2000);
        } else {
          setStatus('error');
          setMessage(res.data.message || '인증에 실패했습니다.');
        }
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        const code = err.response?.status;
        const msg = err.response?.data?.message;

        if (code === 401) setMessage(msg || '유효하지 않거나 만료된 링크입니다.');
        else if (code === 409) setMessage(msg || '이미 인증이 완료된 계정입니다.');
        else setMessage(msg || '서버 오류가 발생했습니다.');

        setStatus('error');
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center">
      {status === 'loading' && (
        <>
          <h1 className="text-2xl font-semibold mb-4">이메일 인증 중...</h1>
          <p className="text-text-primary">잠시만 기다려주세요.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <h1 className="text-2xl font-semibold text-green-600 mb-4">인증 완료!</h1>
          <p className="text-text-primary">{message}</p>
          <p className="text-text-secondary text-sm mt-4">
            잠시 후 로그인 페이지로 이동합니다.
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="text-2xl font-semibold text-red-600 mb-4">인증 실패</h1>
          <p className="text-text-primary">{message}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 px-4 py-2 bg-secondary-700 text-white rounded-md"
          >
            로그인 페이지로 이동
          </button>
        </>
      )}
    </main>
  );
}
