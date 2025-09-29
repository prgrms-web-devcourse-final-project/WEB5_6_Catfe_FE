import Image from 'next/image';

interface SettingAvatarProps {
  avatarUrl: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

// !! 임시 limit - BE에서 이미지 파일 업로드 api 만들어지면 수정할 것
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function SettingAvatar({ avatarUrl, onChange, disabled = false }: SettingAvatarProps) {
  return (
    <div className="flex justify-center">
      <label htmlFor="user-avatar-setting" className="font-light text-sm">
        프로필 이미지
      </label>
      <div className="size-20 rounded-full border-2 border-gray-400 overflow-hidden relative">
        <Image src={avatarUrl ?? '/image/cat-default.svg'} alt="프로필 이미지" fill />
      </div>
      <input type="file" id="user-avatar-setting" className="absolute" />
    </div>
  );
}
export default SettingAvatar;
