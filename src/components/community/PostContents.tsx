'use client';

import { PostDetail } from '@/@types/community';
import Image from 'next/image';
import TiptapRenderer from './TiptapRenderer';
import UserProfile from './UserProfile';
import LikeButton from '../LikeButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import showToast from '@/utils/showToast';
import { useUser } from '@/api/apiUsersMe';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDeletePost, communityQueryKey } from '@/hook/community/useCommunityPost';
import { useConfirm } from '@/hook/useConfirm';

function PostContents({ post }: { post: PostDetail }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data: user } = useUser();

  const {
    postId,
    title,
    author,
    content,
    categories = [],
    likeCount: likeCountProp = 0,
    commentCount = 0,
    createdAt = '',
    updatedAt = '',
  } = post;

  // !! api 업데이트 전 임시 코드
  const isLikedByMe = false;
  const isAuthor = author.id === user?.userId;

  const [liked, setLiked] = useState<boolean>(isLikedByMe);
  const [likeCount, setLikeCount] = useState<number>(likeCountProp);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((c) => c + (liked ? -1 : 1));
  };

  const handleEdit = () => {
    router.push(`/community/editor?id=${postId}`);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDeletePost(id),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: communityQueryKey.post(postId),
      });
      queryClient.invalidateQueries({ queryKey: communityQueryKey.all() });
      showToast('success', '게시글이 삭제되었습니다.');
      router.replace('/community');
    },
    onError: (error: Error) => {
      console.error('게시글 삭제 요청 실패:', error);
      showToast('error', '게시글 삭제에 실패했습니다.');
    },
  });

  const handleDelete = async () => {
    const confirmOk = await confirm({
      title: '게시글을 삭제하시겠습니까?',
      description: <>삭제된 글은 복원할 수 없습니다.</>,
      confirmText: '삭제하기',
      cancelText: '돌아가기',
      tone: 'danger',
    });

    if (!confirmOk) return;
    deleteMutation.mutate(postId);
  };

  return (
    <article className="flex flex-col gap-4 relative">
      <header className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* title & tags */}
        <h2 className="mr-3 text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          {categories &&
            categories.map((category, idx) => (
              <div
                key={`${postId}-category-${idx}`}
                className="px-2 py-1 border-0 bg-primary-500 rounded-sm text-background-white text-xs flex justify-center items-center"
              >
                {category.name}
              </div>
            ))}
        </div>
      </header>

      {/* button groups */}
      <div className="flex gap-4 items-center justify-center absolute top-0 right-0 sm:top-2 sm:right-2">
        {isAuthor ? (
          <>
            <button onClick={handleEdit} aria-label="게시글 수정" className="cursor-pointer">
              <Image
                src="/icon/community/pencil.svg"
                alt=""
                width={20}
                height={20}
                unoptimized
                priority={false}
              />
            </button>
            <button onClick={handleDelete} aria-label="게시글 삭제" className="cursor-pointer">
              <Image
                src="/icon/community/trash.svg"
                alt=""
                width={20}
                height={20}
                unoptimized
                priority={false}
              />
            </button>
          </>
        ) : (
          <button
            onClick={() => console.log('즐겨찾기')}
            aria-label="즐겨찾기에 저장"
            className="cursor-pointer"
          >
            <Image
              src="/icon/community/heart.svg"
              alt=""
              width={20}
              height={20}
              unoptimized
              priority={false}
            />
          </button>
        )}
      </div>

      {/* user Profile */}
      <UserProfile author={author} createdAt={createdAt} updatedAt={updatedAt} />

      <hr />

      {/* TipTap Json Renderer */}
      <TiptapRenderer content={content} />

      <hr />

      {/* likes & comments */}
      <footer className="flex items-center gap-3">
        <LikeButton liked={liked} count={likeCount} onToggle={toggleLike} iconSize={16} />
        <button
          onClick={() => console.log('댓글')}
          aria-label="댓글"
          className="inline-flex gap-1 items-center"
        >
          <div className="relative size-4">
            <Image src="/icon/community/comment.svg" alt="" fill unoptimized priority={false} />
          </div>
          <span className="text-sm">{commentCount}</span>
        </button>
      </footer>
    </article>
  );
}
export default PostContents;
