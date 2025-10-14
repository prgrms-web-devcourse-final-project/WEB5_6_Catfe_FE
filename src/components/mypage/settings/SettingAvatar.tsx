'use client';

import { MAX_FILE_SIZE } from '@/api/apiUploadFile';
import showToast from '@/utils/showToast';
import Image from 'next/image';

interface SettingAvatarProps {
  avatarUrl: string;
  onChange: (file: File) => Promise<void>;
  disabled?: boolean;
}

function SettingAvatar({ avatarUrl, onChange, disabled = false }: SettingAvatarProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      showToast('error', '파일 크기는 10MB 미만이어야 합니다.');
      e.target.value = '';
      return;
    }
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      showToast('error', '이미지 파일만 업로드하실 수 있습니다.');
      e.target.value = '';
      return;
    }

    await onChange(file);
    e.target.value = '';
  };

  return (
    <div className="relative flex justify-center">
      <div className="size-30 rounded-full border-2 border-gray-400 overflow-hidden relative">
        <Image
          src={avatarUrl === '' ? '/image/cat-default.svg' : avatarUrl}
          alt="프로필 이미지"
          fill
          className="object-cover"
        />
      </div>
      <input
        type="file"
        id="user-avatar-setting"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <label
        htmlFor="user-avatar-setting"
        className="absolute bottom-2 left-1/2 translate-x-1/3 bg-background-white px-3 py-1 rounded cursor-pointer font-light text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 border border-zinc-400"
      >
        Edit
      </label>
    </div>
  );
}
export default SettingAvatar;
