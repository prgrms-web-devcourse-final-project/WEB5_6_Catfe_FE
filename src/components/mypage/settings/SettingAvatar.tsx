import Image from 'next/image';

interface SettingAvatarProps {
  avatarUrl: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

// !! 임시 input - BE에서 이미지 파일 업로드 api 만들어지면 수정할 것
// const MAX_FILE_SIZE = 2 * 1024 * 1024;

function SettingAvatar({ avatarUrl, onChange, disabled = false }: SettingAvatarProps) {
  return (
    <div className="relative flex justify-center">
      <div className="size-30 rounded-full border-2 border-gray-400 overflow-hidden relative">
        <Image
          src={avatarUrl === '' ? '/image/cat-default.svg' : avatarUrl}
          alt="프로필 이미지"
          fill
        />
      </div>
      <input
        type="file"
        id="user-avatar-setting"
        className="hidden"
        onChange={(e) => onChange(e.target.value)}
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
