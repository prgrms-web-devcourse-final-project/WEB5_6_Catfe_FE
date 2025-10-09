'use client';

import { useEffect, useId, useState } from 'react';
import Button from '@/components/Button';
import Image from 'next/image';
import clsx from 'clsx';
import { joinRoom, JoinRoomHttpError } from '@/api/apiJoinRoom';

type Props = {
  open: boolean;
  onClose: () => void;
  roomId: number;
  onSuccess: () => void;
};

export default function EnterPasswordModal({
  open,
  onClose,
  roomId,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const errorId = useId();
  const hasError = Boolean(error);
  const canSubmit = password.trim().length > 0;

  useEffect(() => {
    if (open) {
      setPassword('');
      setShow(false);
      setError(undefined);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(undefined);

    try {
      await joinRoom(roomId, { password });
      onSuccess();
    } catch (err) {
      if (err instanceof JoinRoomHttpError) {
        if (err.status === 400 && err.data === 'WRONG_PASSWORD') {
          setError('비밀번호가 올바르지 않습니다.');
        } else if (err.status === 400 && err.data === 'FULL') {
          setError('이미 인원이 가득 찬 방입니다.');
        } else if (err.status === 404) {
          setError('존재하지 않는 방입니다.');
        } else {
          setError(err.message);
        }
      } else {
        setError('입장 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-[300px] rounded-xl bg-background-white p-6 shadow-lg flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">스터디룸 비밀번호</h2>
          <button onClick={onClose} aria-label="닫기" className="cursor-pointer">
            <Image
              src="/icon/study-room/before.svg"
              alt="이전으로 돌아가기"
              width={14}
              height={14}
            />
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
                hasError
                  ? 'border-error-400 focus:ring-error-200 text-error-700'
                  : 'border-text-secondary/70 focus:ring-secondary-300'
              )}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? errorId : undefined}
              disabled={loading}
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
            disabled={!canSubmit || loading}
            aria-disabled={!canSubmit || loading || undefined}
          >
            {loading ? '입장 중...' : '입장하기'}
          </Button>
        </form>
      </div>
    </div>
  );
}
