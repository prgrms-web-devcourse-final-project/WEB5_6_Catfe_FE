'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { apiChangePassword } from '@/api/apiChangePassword';
import showToast from '@/utils/showToast';
import Button from '@/components/Button';
import { useConfirm } from '@/hook/useConfirm';

// 비밀번호 정책: 길이 8글자 이상 + 숫자 1개 이상 + 특수문자 1개 이상
const PW_POLICY = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

function ChangePassword() {
  const confirm = useConfirm();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');

  const [showCurPw, setShowCurPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>('');

  const isPwValid = useCallback((newPassword: string) => {
    if (!PW_POLICY.test(newPassword)) return false;
    return true;
  }, []);

  const canSubmit = currentPassword !== '' && newPassword !== '' && pwConfirm !== '' && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (newPassword !== pwConfirm) {
      setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMsg('변경될 비밀번호는 기존 비밀번호와 달라야 합니다.');
      return;
    }
    if (!isPwValid(newPassword)) {
      setErrorMsg('비밀번호는 최소 8글자 이상, 숫자와 특수문자를 최소 1개 이상 포함해야합니다.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await apiChangePassword({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        showToast('success', '비밀번호가 변경되었습니다.');
        setCurrentPassword('');
        setNewPassword('');
        setPwConfirm('');
        setShowCurPw(false);
        setShowNewPw(false);
        setShowPwConfirm(false);
      } else {
        showToast('error', '비밀번호 변경에 실패했습니다.');
        setErrorMsg(res.message || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '요청 처리 중 오류가 발생했습니다.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (canSubmit) {
      const ok = await confirm({
        title: '비밀번호 변경을 취소하시겠습니까?',
        description: <>변경 중인 사항은 저장되지 않습니다.</>,
        confirmText: '취소하기',
        cancelText: '돌아가기',
        tone: 'danger',
      });
      if (!ok) return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setPwConfirm('');
    setShowCurPw(false);
    setShowNewPw(false);
    setShowPwConfirm(false);
    setErrorMsg('');
  };

  return (
    <section className="flex flex-col gap-5 w-full">
      <h3>비밀번호 변경</h3>
      <hr />
      <form onSubmit={onSubmit} className="flex flex-col gap-5 w-full">
        {/* 현재 비밀번호 */}
        <div className="w-1/2 flex flex-col gap-2">
          <label htmlFor="current-password" className="font-light text-sm">
            현재 비밀번호
          </label>
          <div className="relative focus-within:outline-none focus-within:ring-2 focus-within:ring-secondary-400 py-2 border border-gray-400 rounded-md">
            <input
              id="current-password"
              name="current-password"
              type={showCurPw ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              required
              className="w-full h-full px-10 focus:outline-none"
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
        </div>
        <div className="flex gap-2">
          {/* 새로운 비밀번호 */}
          <div className="w-full flex flex-col gap-2">
            <label htmlFor="new-password" className="font-light text-sm">
              새로운 비밀번호
            </label>
            <div className="relative focus-within:outline-none focus-within:ring-2 focus-within:ring-secondary-400 py-2 border border-gray-400 rounded-md">
              <input
                id="new-password"
                name="new-password"
                type={showNewPw ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full h-full px-10 focus:outline-none"
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
          </div>
          {/* 비밀번호 확인 */}
          <div className="w-full flex flex-col gap-2">
            <label htmlFor="confirm-password" className="font-light text-sm">
              새로운 비밀번호 확인
            </label>
            <div className="relative focus-within:outline-none focus-within:ring-2 focus-within:ring-secondary-400 py-2 border border-gray-400 rounded-md">
              <input
                id="confirm-password"
                name="confirm-password"
                type={showPwConfirm ? 'text' : 'password'}
                placeholder="Password Confirm"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                required
                className="w-full h-full px-10 focus:outline-none"
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
        {errorMsg && <p className="text-error-500">{errorMsg}</p>}
        <Button
          type="submit"
          size="md"
          className="rounded-full mx-auto"
          disabled={!canSubmit || submitting}
        >
          {submitting ? '저장 중...' : '변경사항 저장'}
        </Button>
        {canSubmit && (
          <Button
            size="md"
            borderType="outline"
            className="rounded-full mx-auto"
            onClick={handleCancel}
          >
            취소
          </Button>
        )}
      </form>
    </section>
  );
}
export default ChangePassword;
