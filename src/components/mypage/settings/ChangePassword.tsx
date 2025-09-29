'use client';

import { useState } from 'react';
import Image from 'next/image';

function ChangePassword() {
  const [showCurPw, setShowCurPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-5 w-full">
      <h3>비밀번호 변경</h3>
      <hr />
      <div className="relative w-1/2 h-[64px]">
        <label htmlFor="password" className="sr-only">
          새로운 비밀번호
        </label>
        <input
          id="password"
          name="password"
          type={showCurPw ? 'text' : 'password'}
          placeholder="New Password"
          required
          className="w-full h-full pl-10 pr-10 border border-gray-400 rounded-md"
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
          onClick={() => setShowCurPw((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label={showCurPw ? '비밀번호 숨기기' : '비밀번호 보기'}
        >
          <Image
            src={showCurPw ? '/icon/blind.svg' : '/icon/closed.svg'}
            alt="비밀번호 보기"
            width={20}
            height={20}
          />
        </button>
      </div>
      <div className="flex gap-2">
        <div className="relative w-full h-[64px]">
          <label htmlFor="password" className="sr-only">
            새로운 비밀번호
          </label>
          <input
            id="password"
            name="password"
            type={showNewPw ? 'text' : 'password'}
            placeholder="New Password"
            required
            className="w-full h-full pl-10 pr-10 border border-gray-400 rounded-md"
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
            onClick={() => setShowNewPw((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={showNewPw ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            <Image
              src={showNewPw ? '/icon/blind.svg' : '/icon/closed.svg'}
              alt="비밀번호 보기"
              width={20}
              height={20}
            />
          </button>
        </div>
        <div className="relative w-full h-[64px]">
          <label htmlFor="confirm" className="sr-only">
            새로운 비밀번호 확인
          </label>
          <input
            id="confirm"
            name="confirm"
            type={showPwConfirm ? 'text' : 'password'}
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
            aria-label={showPwConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            <Image
              src={showPwConfirm ? '/icon/blind.svg' : '/icon/closed.svg'}
              alt="비밀번호 보기"
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
export default ChangePassword;
