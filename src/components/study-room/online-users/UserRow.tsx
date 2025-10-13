import clsx from 'clsx';
import type { UsersListItem } from '@/@types/rooms';
import Image from 'next/image';

export default function UserRow({
  user,
  canControl,
  onToggleMute,
}: {
  user: UsersListItem;
  canControl?: boolean;
  onToggleMute?: (id: string) => void;
}) {
  const muted = !!user.voice?.muted;

  const showMicButton = !!canControl && !user.isMe && user.role !== 'HOST';

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
          {/* 온라인 점*/}
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-background-white bg-success-500" />
        </div>

        <span
          className={clsx(
            'truncate text-xs',
            user.role === 'HOST' ? 'text-primary-500 font-semibold' : 'text-text-primary-800'
          )}
          title={user.name}
        >
          {user.name}
        </span>
      </div>

      {/* 마이크 제어 버튼 */}
      {showMicButton && (
        <button
          onClick={() => onToggleMute?.(String(user.id))}
          className={clsx(
            'rounded-md',
            muted ? 'text-primary-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'
          )}
          aria-label={muted ? `${user.name} 마이크 해제` : `${user.name} 마이크 음소거`}
        >
          {/* {muted ? (
            <Image src="/icon/study-room/mic-off.svg" alt="마이크 꺼짐" width={20} height={20} />
          ) : (
            <Image src="/icon/study-room/mic-on.svg" alt="마이크 켜짐" width={20} height={20} />
          )} */}
        </button>
      )}
    </li>
  );
}
