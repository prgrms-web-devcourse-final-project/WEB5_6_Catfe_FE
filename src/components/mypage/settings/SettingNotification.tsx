'use client';

import { NotificationType } from '@/@types/notification';
import Button from '@/components/Button';
import ToggleButton from '@/components/ToggleButton';
import { useConfirm } from '@/hook/useConfirm';
import showToast from '@/utils/showToast';
import { useMemo, useState } from 'react';

export type NotificationSettings = Record<NotificationType, boolean> & {
  all: boolean;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  all: true,
  room_join: true,
  room_notice: true,
  post_comment: true,
  like_received_post: true,
  like_received_comment: true,
};

function SettingNotification() {
  const confirm = useConfirm();

  const [initial, setInitial] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  // !! 임시 코드 - api 개발 이후 실제 사용자 설정 불러오기 !!
  // useEffect(() => {
  // const res = fetch('api/notifications/me/???').then().then()...
  // setInitial(res.json())
  // }, []);

  const hasChanged = useMemo(() => {
    if (!initial) return false;
    return JSON.stringify(initial) !== JSON.stringify(settings);
  }, [initial, settings]);

  // Setting update
  const update = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => {
      if (key === 'all') {
        const next = Object.keys(prev).reduce((acc, k) => {
          acc[k as keyof NotificationSettings] = value;
          return acc;
        }, {} as NotificationSettings);
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  // !! 임시 코드 - api 개발 이후 실제 서버 통신 붙이기
  const handleSave = async () => {
    try {
      setSaving(true);
      // await fetch('api/notifications', { method: 'PUT'})
      console.log(settings);
      setInitial(settings);
      showToast('success', '알림 설정이 저장되었습니다.');
    } catch (err) {
      showToast('error', '저장 중 오류가 발생했습니다.');
      console.error('notification patch failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (hasChanged) {
      const ok = await confirm({
        title: '알림 설정 변경을 취소하시겠습니까?',
        description: <>변경 중인 사항은 저장되지 않습니다.</>,
        confirmText: '취소하기',
        cancelText: '돌아가기',
        tone: 'danger',
      });
      if (!ok) return;
    }
    setSettings(initial);
  };

  return (
    <section className="flex flex-col gap-5 w-full">
      <h3>알림 설정</h3>
      <hr />
      <div className="flex flex-col gap-8">
        <div className="w-full flex justify-between">
          <h4 className="font-semibold">전체 알림 켜기 / 끄기</h4>
          <ToggleButton checked={settings.all} onChange={(v) => update('all', v)} />
        </div>
        <div className="w-full flex flex-col gap-4">
          <h4 className="font-semibold">스터디룸</h4>
          <div className="w-full flex justify-between">
            <li className="font-light ml-6">내가 만든 스터디룸에 다른 사람이 입장할 경우 알림</li>
            <ToggleButton checked={settings.room_join} onChange={(v) => update('room_join', v)} />
          </div>
          <div className="w-full flex justify-between">
            <li className="font-light ml-6">내가 참여한 스터디룸에 새로운 공지가 있을 경우 알림</li>
            <ToggleButton
              checked={settings.room_notice}
              onChange={(v) => update('room_notice', v)}
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <h4 className="font-semibold">커뮤니티</h4>
          <div className="w-full flex justify-between">
            <li className="font-light ml-6">내가 작성한 글에 달린 댓글 알림</li>
            <ToggleButton
              checked={settings.post_comment}
              onChange={(v) => update('post_comment', v)}
            />
          </div>
          <div className="w-full flex justify-between">
            <li className="font-light ml-6">내가 작성한 글에 달린 좋아요 알림</li>
            <ToggleButton
              checked={settings.like_received_post}
              onChange={(v) => update('like_received_post', v)}
            />
          </div>
          <div className="w-full flex justify-between">
            <li className="font-light ml-6">내가 작성한 댓글에 달린 좋아요 알림</li>
            <ToggleButton
              checked={settings.like_received_comment}
              onChange={(v) => update('like_received_comment', v)}
            />
          </div>
        </div>
      </div>
      <Button
        size="md"
        className="rounded-full mx-auto"
        onClick={handleSave}
        disabled={!hasChanged || saving}
      >
        {saving ? '저장 중...' : '변경사항 저장'}
      </Button>
      {hasChanged && (
        <Button
          size="md"
          borderType="outline"
          className="rounded-full mx-auto"
          onClick={handleCancel}
        >
          취소
        </Button>
      )}
    </section>
  );
}
export default SettingNotification;
