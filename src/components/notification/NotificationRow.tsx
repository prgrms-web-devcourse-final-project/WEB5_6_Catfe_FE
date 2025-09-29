import { NotificationItem } from '@/@types/notification';
import tw from '@/utils/tw';
import Image from 'next/image';
import Button from '../Button';
import { formatRelativeDate } from '@/utils/formatRelativeDate';

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}) {
  const notificationInfo = (item: NotificationItem) => {
    switch (item.type) {
      case 'room_join':
        return (
          <>
            <strong className="font-semibold">{item.actor.nickname}</strong>
            <span className="mx-1">님이 회원님의 스터디룸</span>
            <span className="font-medium">{item.title}</span>
            <span>에 입장했습니다.</span>
          </>
        );
      case 'room_notice':
        return (
          <>
            <span className="mx-1">회원님이 참여 중인 스터디룸</span>
            <span className="font-medium">{item.title}</span>
            <span>에 새로운 공지가 올라왔습니다.</span>
          </>
        );

      case 'post_comment':
        return (
          <>
            <strong className="font-semibold">{item.actor.nickname}</strong>
            <span className="mx-1">님이 회원님의 글</span>
            <span className="font-medium">{item.title}</span>
            <span>에 댓글을 달았습니다.</span>
          </>
        );
      case 'like_received_post':
        return (
          <>
            <strong className="font-semibold">{item.actor.nickname}</strong>
            <span className="mx-1">님이 회원님의 글</span>
            <span className="font-medium">{item.title}</span>
            <span>을 좋아합니다.</span>
          </>
        );
      case 'like_received_comment':
        return (
          <>
            <strong className="font-semibold">{item.actor.nickname}</strong>
            <span className="mx-1">님이</span>
            <span className="font-medium">{item.title}</span>
            <span>글에 달린 회원님의 댓글을 좋아합니다.</span>
          </>
        );
    }
  };

  return (
    <li
      className={tw(
        'relative border-b border-secondary-600',
        item.unread ? 'bg-secondary-200' : 'bg-secondary-50'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Actor Profile */}
        <div className="size-8 shrink-0 rounded-full flex items-center justify-center border-2 border-gray-400 overflow-hidden relative">
          <Image
            src={item.actor.avatarUrl ?? '/image/cat-default.svg'}
            alt={item.actor.nickname}
            width={30}
            height={30}
          />
        </div>
        <div>
          {/* Noti info */}
          <div className="flex-1 text-sm font-light">
            {notificationInfo(item)}{' '}
            <span className="text-[10px] text-text-secondary">
              {formatRelativeDate(item.createdAt)}
            </span>
          </div>
          {item.message && (item.type === 'room_notice' || item.type === 'post_comment') && (
            <div className="mt-2 rounded-md border-l-2 border-primary-300 px-3 py-2 text-xs leading-5 text-text-secondary">
              {item.message}
            </div>
          )}
          {item.ctaLabel && (
            <Button
              color="primary"
              borderType="solid"
              size="sm"
              className="mt-2"
              onClick={() => onRead(item.id)}
            >
              {item.ctaLabel ?? '보러가기'}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
export default NotificationRow;
