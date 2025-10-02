'use client';

import CommentList from '@/components/community/CommentList';
import PostContents from '@/components/community/PostContents';
import Spinner from '@/components/Spinner';
import { useComments, usePost } from '@/hook/useCommunityPost';
import { useEffect } from 'react';

function ContentsDetail({ postId }: { postId: string }) {
  const { data: post, isLoading: loadingPost } = usePost(postId);
  const { data: comments, isLoading: loadingComments } = useComments(postId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [postId]);

  // api 연결 전 UI 확인용 임시
  // const loadingPost = true;
  // const loadingComments = true;

  if (loadingPost)
    return (
      <div className="h-full w-full">
        <Spinner />
      </div>
    );

  // 나중에 에러fallback으로 수정할 것
  if (!post)
    return (
      <div className="h-full w-full">
        <p className="text-error-500">게시글을 찾을 수 없습니다.</p>
      </div>
    );

  return (
    <div className="mx-auto flex flex-col gap-3">
      <PostContents post={post} />
      <CommentList comments={comments} isLoading={loadingComments} />
    </div>
  );
}
export default ContentsDetail;
