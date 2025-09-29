import Image from 'next/image';
import { formatRelativeDate } from '@/utils/formatRelativeDate';
import { Post } from '@/@types/community';
import tw from '@/utils/tw';

type UserProfileProps = Pick<Post, 'author' | 'createdAt' | 'updatedAt'> & {
  isComment?: boolean;
  className?: string;
};

function UserProfile({
  author,
  createdAt = '',
  updatedAt = '',
  isComment = false,
  className = '',
}: UserProfileProps) {
  return (
    <div className={tw('flex gap-2 items-center', className)}>
      <div
        className={tw(
          'size-8 rounded-full border-2 border-gray-400 overflow-hidden',
          isComment && 'size-5'
        )}
      >
        <Image
          src={author.profile_image_url ?? '/image/cat-default.svg'}
          alt={author.nickname}
          width={isComment ? 20 : 30}
          height={isComment ? 20 : 30}
        />
      </div>
      <span className={isComment ? 'text-xs' : 'text-base'}>{author.nickname}</span>
      <span className="block mx-1 bg-black rounded-full w-0.5 h-0.5" />
      {updatedAt ? (
        <span className="text-xs text-text-secondary">{formatRelativeDate(updatedAt)} 수정</span>
      ) : (
        <span className="text-xs text-text-secondary">{formatRelativeDate(createdAt)} 작성</span>
      )}
    </div>
  );
}
export default UserProfile;
