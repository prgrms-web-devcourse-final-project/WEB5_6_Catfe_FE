'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Image from 'next/image';

type EnterPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
};

export default function EnterPasswordModal({
  open,
  onClose,
  onSubmit,
}: EnterPasswordModalProps) {
  const [password, setPassword] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-[300px] rounded-xl border border-gray-300 bg-white p-6 shadow-lg flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">스터디룸 비밀번호</h2>
          <button onClick={onClose} aria-label="닫기" className='cursor-pointer'>
            <Image src="/icon/study-room/before.svg" alt='이전으로 돌아가기' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="스터디룸 비밀번호를 입력해 주세요"
            className="w-full rounded-lg border border-text-secondary/70 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-secondary-300"
          />

          <Button
            type="submit"
            size="lg"
            borderType="solid"
            color="secondary"
            className="font-bold"
            fullWidth
          >
            입장하기
          </Button>
        </form>
      </div>
    </div>
  );
}
