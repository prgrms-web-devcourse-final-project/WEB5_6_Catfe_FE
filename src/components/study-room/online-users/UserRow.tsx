import clsx from 'clsx';
import type { UsersListItem } from '@/@types/rooms';
import Image from 'next/image';

export default function UserRow({
  user,
  // canControl,
  // onToggleMute,
}: {
  user: UsersListItem;
  canControl?: boolean;
  onToggleMute?: (id: string) => void;
}) {
  // const muted = !!user.voice?.muted;

  // const showMicButton = !!canControl && !user.isMe && user.role !== 'HOST';

  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* 아바타 */}
        <div className="relative">
          <div className="w-7 h-7 rounded-md bg-gray-200 overflow-hidden">
            {user.avatarUrl && (
              <Image
                src={user.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
                width={20}
                height={20}
                loading="lazy"
              />
            )}
          </div>
        </div>

        <span
          className={clsx(
            'truncate text-xs flex items-center gap-1 text-text-primary-800 text-bold'
          )}
          title={user.name}
        >
          {user.name}
          {user.role === 'HOST' && (
            <span className="text-xs font-normal text-primary-500">(host)</span>
          )}
        </span>
      </div>

      {/* 방 추방 버튼으로 변경 예정*/}
      {/* {showMicButton && (
        <button
          onClick={() => onToggleMute?.(String(user.id))}
          className={clsx(
            'rounded-md',
            muted ? 'text-primary-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'
          )}
          aria-label={muted ? `${user.name} 마이크 해제` : `${user.name} 마이크 음소거`}
        >
          {muted ? (
            <Image src="/icon/study-room/mic-off.svg" alt="마이크 꺼짐" width={20} height={20} />
          ) : (
            <Image src="/icon/study-room/mic-on.svg" alt="마이크 켜짐" width={20} height={20} />
          )}
        </button>
      )} */}
    </li>
  );
}
