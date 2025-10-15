'use client';

import { PostDetail } from '@/@types/community';
import Image from 'next/image';
import TiptapRenderer from './TiptapRenderer';
import UserProfile from './UserProfile';
import LikeButton from '../LikeButton';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import showToast from '@/utils/showToast';
import { useUser } from '@/api/apiUsersMe';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiDeletePost,
  communityQueryKey,
  useTogglePostBookmarkMutation,
  useTogglePostLikeMutation,
} from '@/hook/community/useCommunityPost';
import { useConfirm } from '@/hook/useConfirm';
import useRequireLogin from '@/hook/useRequireLogin';

function PostContents({ post }: { post: PostDetail }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const requireLogin = useRequireLogin();
  const { data: user } = useUser();

  const {
    postId,
    title,
    author,
    content,
    categories = [],
    likeCount: likeCountProp = 0,
    commentCount = 0,
    bookmarkCount: bookmarkCountProp = 0,
    createdAt = '',
    updatedAt = '',
    likedByMe = false,
    bookmarkedByMe = false,
  } = post;

  const isAuthor = author.id === user?.userId;

  const [liked, setLiked] = useState<boolean>(likedByMe);
  const [likeCount, setLikeCount] = useState<number>(likeCountProp);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(bookmarkedByMe);
  const [bookmarkCount, setBookmarkCount] = useState<number>(bookmarkCountProp);

  useEffect(() => {
    setLiked(likedByMe);
    setLikeCount(likeCountProp);
    setIsBookmarked(bookmarkedByMe);
    setBookmarkCount(bookmarkCountProp);
  }, [likedByMe, likeCountProp, bookmarkedByMe, bookmarkCountProp]);

  const { mutate: togglePostLikeMutate } = useTogglePostLikeMutation();
  const { mutate: togglePostBookmarkMutate } = useTogglePostBookmarkMutation();

  const toggleLike = () => {
    if (!requireLogin(`/community/${postId}`)) return;
    const nextLiked = !liked;
    const nextLikeCount = likeCount + (nextLiked ? 1 : -1);
    // Optimistic Update
    setLiked(nextLiked);
    setLikeCount(nextLikeCount);

    togglePostLikeMutate(
      { postId, isLiked: nextLiked },
      {
        onError: (error, variables) => {
          console.error('게시글 좋아요 토글 실패:', error);
          showToast('error', '좋아요 처리에 실패했습니다. 다시 시도해주세요.');

          // 실패 시 롤백 (Optimistic Update 취소)
          setLiked(!variables.isLiked);
          setLikeCount(nextLikeCount + (nextLiked ? -1 : 1));
        },
      }
    );
  };

  const handleToggleBookmark = () => {
    if (!requireLogin(`/community/${postId}`)) return;

    const nextBookmarked = !isBookmarked;
    // 1. Optimistic Update
    setIsBookmarked(nextBookmarked);
    setBookmarkCount((c) => c + (nextBookmarked ? 1 : -1));

    // 2. API 호출
    togglePostBookmarkMutate(
      { postId, isBookmarked: nextBookmarked },
      {
        onError: (error, variables) => {
          console.error('게시글 북마크 토글 실패:', error);
          showToast('error', '즐겨찾기 처리에 실패했습니다. 다시 시도해주세요.');

          // 3. 롤백 (API 실패 시)
          setIsBookmarked(!variables.isBookmarked);
          setBookmarkCount((c) => c + (nextBookmarked ? -1 : 1));
        },
      }
    );
  };

  const handleEdit = () => {
    if (!requireLogin(`/community/editor?id=${postId}`)) return;
    router.push(`/community/editor?id=${postId}`);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDeletePost(id),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: communityQueryKey.post(postId, ''),
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
    if (!requireLogin(`/community/${postId}`)) return;
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
            onClick={handleToggleBookmark}
            aria-label={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기에 저장'}
            className="cursor-pointer inline-flex gap-2 items-center"
          >
            <div className="size-5 relative">
              <Image
                src={isBookmarked ? '/icon/community/heart-fill.svg' : '/icon/community/heart.svg'}
                alt=""
                fill
                unoptimized
                priority={false}
              />
            </div>
            <span>{bookmarkCount}</span>
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
        <div className="inline-flex gap-1 items-center">
          <div className="relative size-4">
            <Image src="/icon/community/comment.svg" alt="" fill unoptimized priority={false} />
          </div>
          <span className="text-sm">{commentCount}</span>
        </div>
      </footer>
    </article>
  );
}
export default PostContents;
