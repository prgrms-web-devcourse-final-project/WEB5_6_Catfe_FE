'use client';

import { User, UserProfile } from '@/@types/type';
import Button from '@/components/Button';
import { useEffect, useMemo, useState } from 'react';
import SettingAvatar from './SettingAvatar';
import { useConfirm } from '@/hook/useConfirm';
import { useProfileSetting } from '@/hook/useProfileSetting';
import showToast from '@/utils/showToast';
import Spinner from '@/components/Spinner';
import { Info } from 'lucide-react';

const MAX_BIO_LIMIT = 300;

// !! Error 처리 아직 안함 추가 필요 !!

function SettingProfile() {
  const confirm = useConfirm();
  const { data: me, isLoading, saveProfile, saving } = useProfileSetting();

  const initial = useMemo(() => {
    if (!me) return null;
    const flat: Partial<User> & UserProfile = {
      userId: me.userId,
      username: me.username,
      email: me.email,
      nickname: me.profile.nickname ?? '',
      bio: me.profile.bio ?? '',
      profileImageUrl: me.profile.profileImageUrl ?? '',
      point: me.profile.point ?? 0,
    };
    return flat;
  }, [me]);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const maxLength = MAX_BIO_LIMIT;

  useEffect(() => {
    if (!initial) return;
    setNickname(initial.nickname ?? '');
    setBio(initial.bio ?? '');
    setAvatarUrl(initial.profileImageUrl ?? '');
  }, [initial]);

  const hasChanged = useMemo(() => {
    if (!initial) return nickname !== '' || bio !== '' || avatarUrl !== '';
    return (
      (initial.nickname ?? '') !== nickname ||
      (initial.bio ?? '') !== bio ||
      (initial.profileImageUrl ?? '') !== avatarUrl
    );
  }, [initial, nickname, bio, avatarUrl]);

  const handleSave = async () => {
    try {
      await saveProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        profileImageUrl: avatarUrl,
        birthDate: null,
      });
      showToast('success', '프로필이 저장되었습니다.');
      setIsEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        '프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.';
      showToast('error', msg);
    }
  };

  const handleCancel = async () => {
    if (hasChanged) {
      const ok = await confirm({
        title: '정보 변경을 취소하시겠습니까?',
        description: <>변경 중인 사항은 저장되지 않습니다.</>,
        confirmText: '취소하기',
        cancelText: '돌아가기',
        tone: 'danger',
      });
      if (!ok) return;
    }
    setNickname(initial?.nickname ?? '');
    setBio(initial?.bio ?? '');
    setAvatarUrl(initial?.profileImageUrl ?? '');
    setIsEditing(false);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-5 w-full">
      <h3>프로필 설정</h3>
      <hr />
      <div className="flex gap-8">
        <div className="w-2/3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="block font-light text-sm">ID</span>
            <span className="block">{initial?.username}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="block font-light text-sm">이메일</span>
            <span className="block">{initial?.email}</span>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="user-name-setting" className="font-light text-sm">
              닉네임
            </label>
            <input
              type="text"
              id="user-name-setting"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsEditing(true);
              }}
              className="w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-400 appearance-none"
            />
            <span className="font-light text-xs text-zinc-400 text-left flex gap-1">
              <Info className="w-4 h-4" />
              스터디룸에서 표시될 이름입니다.
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="user-bio-setting" className="font-light text-sm">
              자기소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setIsEditing(true);
              }}
              rows={6}
              placeholder="자기소개를 입력해주세요"
              aria-describedby="bio-help bio-error"
              className="w-full rounded-lg border border-zinc-300 p-3 outline-none focus:ring-1 focus:ring-secondary-400 bg-background-white text-sm resize-none"
              maxLength={maxLength}
            />
            <div className="flex items-center justify-end text-sm text-text-secondary/50">
              <span>
                <strong className={bio.length > maxLength ? 'text-error-500' : ''}>
                  {bio.length}
                </strong>{' '}
                / {maxLength}
              </span>
            </div>
          </div>
        </div>
        <div className="w-1/3">
          <SettingAvatar
            avatarUrl={avatarUrl}
            onChange={(v) => {
              setAvatarUrl(v);
              setIsEditing(true);
            }}
          />
        </div>
      </div>
      <Button
        size="md"
        className="rounded-full mx-auto"
        onClick={handleSave}
        disabled={!isEditing || !hasChanged || saving}
      >
        {saving ? '저장 중...' : '변경사항 저장'}
      </Button>
      {isEditing && (
        <Button
          size="md"
          borderType="outline"
          className="rounded-full mx-auto"
          onClick={handleCancel}
        >
          취소
        </Button>
      )}
    </div>
  );
}
export default SettingProfile;
