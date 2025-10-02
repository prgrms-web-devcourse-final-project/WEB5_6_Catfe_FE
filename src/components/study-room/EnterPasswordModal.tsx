'use client';

import { useEffect, useId, useState } from 'react';
import Button from '@/components/Button';
import Image from 'next/image';
import clsx from 'clsx';

type Props = {
  open: boolean;
  onClose: () => void;
  expectedPassword?: string | null;
  onSuccess: () => void;
};

export default function EnterPasswordModal({
  open,
  onClose,
  expectedPassword,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const errorId = useId();
  const hasError = Boolean(error);
  const canSubmit = password.trim().length > 0;

  useEffect(() => {
    if (open) {
      setPassword('');
      setShow(false);
      setError(undefined);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const correct = (expectedPassword ?? '').trim();
    if (!correct || password.trim() !== correct) {
      setError('비밀번호가 틀렸습니다.');
      return;
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-[300px] rounded-xl bg-background-white p-6 shadow-lg flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">스터디룸 비밀번호</h2>
          <button onClick={onClose} aria-label="닫기" className="cursor-pointer">
            <Image src="/icon/study-room/before.svg" alt="이전으로 돌아가기" width={14} height={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative w-full">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(undefined);
              }}
              placeholder="스터디룸 비밀번호를 입력해 주세요"
              className={clsx(
                'w-full rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 pr-9 border',
                hasError ? 'border-error-400 focus:ring-error-200 text-error-700' : 'border-text-secondary/70 focus:ring-secondary-300'
              )}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? errorId : undefined}
            />

            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              tabIndex={-1}
            >
              <Image
                src={show ? '/icon/study-room/hide.svg' : '/icon/study-room/show.svg'}
                alt={show ? '숨기기' : '보이기'}
                width={14}
                height={14}
              />
            </button>
          </div>

          {hasError && (
            <p id={errorId} role="alert" className="text-[10px] text-error-500 -mt-3">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            borderType="solid"
            color="secondary"
            className="font-bold"
            fullWidth
            disabled={!canSubmit}
            aria-disabled={!canSubmit || undefined}
          >
            입장하기
          </Button>
        </form>
      </div>
    </div>
  );
}
