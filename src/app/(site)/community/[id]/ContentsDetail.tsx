'use client';

import CommentList from '@/components/community/CommentList';
import PostContents from '@/components/community/PostContents';
import Spinner from '@/components/Spinner';
import { usePost } from '@/hook/community/useCommunityPost';
import { useEffect } from 'react';

function ContentsDetail({ postId }: { postId: number }) {
  const { data: post, isLoading: loadingPost } = usePost(postId);

  useEffect(() => {
    if (postId) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [postId]);

  if (loadingPost)
    return (
      <div className="h-full w-full">
        <Spinner />
      </div>
    );

  if (!post)
    return (
      <div className="h-full w-full">
        <p className="text-error-500">게시글을 찾을 수 없습니다.</p>
      </div>
    );

  return (
    <div className="mx-auto flex flex-col gap-3">
      <PostContents post={post} />
      <CommentList postId={postId} />
    </div>
  );
}
export default ContentsDetail;
