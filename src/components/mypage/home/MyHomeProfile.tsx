'use client';

import { User } from '@/@types/type';
import { useUser } from '@/api/apiUsersMe';
import Button from '@/components/Button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function MyHomeProfile() {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  const currentUser: Partial<User> = user || {
    email: 'guest@catfe.com',
    profile: {
      nickname: 'GUEST',
      profileImageUrl: '/image/cat-default.svg',
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 bg-background-white rounded-2xl border-2 border-secondary-600 px-4 py-5 animate-pulse">
        {/* 프로필 이미지 스켈레톤 */}
        <div className="size-20 rounded-full border-2 border-secondary-600 bg-gray-400 mx-auto" />
        {/* 닉네임 / 이메일 스켈레톤 */}
        <div className="flex flex-col gap-2 items-center">
          <div className="w-24 h-5 bg-gray-400 rounded-md" />
          <div className="w-40 h-4 bg-gray-400 rounded-md" />
        </div>
        {/* 자기소개 스켈레톤 */}
        <div className="h-16 w-full bg-gray-400 rounded-md" />
        {/* 버튼 영역 */}
        <div className="w-24 h-9 bg-gray-400 rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-background-white rounded-2xl border-2 border-secondary-600 px-4 py-5 w-full md:w-[250px] shadow-md">
      <div className="size-28 rounded-full border-2 border-secondary-600 overflow-hidden relative">
        <Image
          src={currentUser.profile?.profileImageUrl || '/image/cat-default.svg'}
          alt={currentUser.profile?.nickname || '프로필 사진'}
          fill
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-lg">{currentUser.profile?.nickname}</span>
        <span className="text-sm font-light underline">{currentUser.email}</span>
      </div>
      {currentUser.profile?.bio ? (
        <div className="relative">
          <p className="h-20 max-h-20 overflow-scroll whitespace-pre-line pb-4">
            {currentUser.profile?.bio}
          </p>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-secondary-600/20 to-transparent rounded-lg" />
        </div>
      ) : (
        <p className="h-20 max-h-20 text-sm text-text-secondary inline-flex items-center justify-center">
          아직 입력된 자기소개가 없습니다.
        </p>
      )}
      <Button
        size="md"
        hasIcon
        className="mx-auto rounded-full"
        onClick={() => router.push('/mypage/settings')}
      >
        <div className="size-5 relative">
          <Image src="/icon/mypage/edit.svg" alt="수정" fill />
        </div>
        Edit
      </Button>
    </div>
  );
}
export default MyHomeProfile;
