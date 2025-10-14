'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/Button';
import Image from 'next/image';
import clsx from 'clsx';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (code: string) => Promise<void> | void;
  loading?: boolean;
};

export default function InviteEnterModal({ open, onClose, onSubmit, loading = false }: Props) {
  const [code, setCode] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setCode('');
      setTouched(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const normalized = useMemo(
    () => code.replace(/[\s-]/g, '').toUpperCase(),
    [code]
  );

  const isValid = /^[A-Z0-9]{6,12}$/.test(normalized);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || loading) return;
    await onSubmit?.(normalized);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      aria-labelledby="invite-enter-title"
      role="dialog"
      aria-modal="true"
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* dialog */}
      <div
        ref={dialogRef}
        className="relative z-10 w-[90vw] max-w-[420px] rounded-2xl border border-text-secondary bg-background-white p-5 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 id="invite-enter-title" className="text-base font-bold text-text-primary">
            초대 코드로 입장
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-md p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 cursor-pointer"
          >
            <Image src="/icon/study-room/close.svg" alt="" width={20} height={20} />
          </button>
        </div>
        <span id="invite-enter-help" className="text-[12px] text-text-secondary">
            공유받은 초대 코드를 입력해주세요.
        </span>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div
            className={clsx(
              'flex items-center gap-2 rounded-lg border border-text-secondary px-3 py-2',
              'focus-within:ring-2 focus-within:ring-primary-300'
            )}
          >
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="예: ABCDEFGH"
              maxLength={16}
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 outline-none"
              aria-invalid={touched && !isValid}
              aria-describedby="invite-enter-help"
            />
          </div>

          

          {touched && !isValid && (
            <p className="text-[12px] text-red-500">유효한 초대 코드를 입력해주세요.</p>
          )}

          <div className='flex justify-center'>
            <Button
              type="submit"
              size="md"
              borderType="solid"
              color="primary"
              disabled={!isValid || loading}
              className="mt-1"
            >
              {loading ? '입장 중...' : '입장하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
