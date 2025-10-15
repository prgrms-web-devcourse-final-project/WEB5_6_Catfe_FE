'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import InviteEnterModal from '@/components/study-rooms-list/InviteEnterModal';
import { enterByInviteCode } from '@/api/apiRooms';
import showToast from '@/utils/showToast';
import { hasAccessToken } from '@/utils/api';

export default function InviteEnterButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        type="button"
        size="sm"
        borderType="outline"
        color="primary"
        onClick={() => setOpen(true)}
        className="ml-auto"
      >
        초대 코드로 입장하기
      </Button>

      <InviteEnterModal
        open={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onSubmit={async (code) => {
          if (!hasAccessToken()) {
            showToast('warn', '로그인이 필요합니다.');
            const current = typeof window !== 'undefined' ? window.location.href : '/study-rooms';
            router.push(`/login?redirect=${encodeURIComponent(current)}`);
            return;
          }

          setLoading(true);
          try {
            const res = await enterByInviteCode(code);
            showToast('success', '입장합니다!');
            router.push(`/study-rooms/${res.roomId}`);
          } catch (e) {
            showToast('error', (e as Error)?.message ?? '초대 코드 입장에 실패했어요.');
          } finally {
            setLoading(false);
            setOpen(false);
          }
        }}
      />
    </>
  );
}
