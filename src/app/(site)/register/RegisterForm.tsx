'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { register } from '@/api/auth';
import { AxiosError } from "axios";
import showToast from '@/utils/showToast';

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

  if (!passwordRegex.test(password)) {
    setError("비밀번호는 최소 8자 이상이며, 숫자와 특수문자를 각각 1개 이상 포함해야 합니다.");
    return;
  }

    setError('');
    setLoading(true);

    try {
      await register({
        username: id,
        email,
        password,
        nickname: name,
      });
      showToast("success", "회원가입 완료! 이메일 인증 메일을 확인해주세요.");
      router.replace('/login'); 
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const msg =
        axiosError.response?.data?.message || "회원가입 처리 중 오류가 발생했습니다.";
      setError(msg);
      showToast("error", msg);
    } finally {
          setLoading(false);
        }
      };


  return (
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
          type={showPassword ? 'text' : 'password'}
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
            src={showPassword ? '/icon/closed.svg' : '/icon/blind.svg'}
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
          type={showPasswordConfirm ? 'text' : 'password'}
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
            src={showPasswordConfirm ? '/icon/closed.svg' : '/icon/blind.svg'}
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
          />
        </button>
      </div>
      {/* 닉네임 */}
      <div className="relative">
        <label htmlFor="register-name" className="sr-only">
          닉네임
        </label>
        <input
          id="register-name"
          type="text"
          placeholder="Nickname"
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
        {loading ? 'Processing...' : 'Register'}
      </Button>
      {error && (
        <p className="text-error-600 text-center text-sm mt-2" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </form>
  );
}
export default RegisterForm;
