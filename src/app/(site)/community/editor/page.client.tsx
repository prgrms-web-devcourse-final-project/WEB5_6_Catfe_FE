'use client';

import { useSearchParams } from 'next/navigation';
import { usePost } from '@/hook/useCommunityPost';
import Spinner from '@/components/Spinner';
import PostEditor from '@/components/community/PostEditor';

function EditorPageClient() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');

  const { data: initialData, isLoading, isError } = usePost(postId || '');

  // 임시 error fallback
  if (isError) {
    return <div>오류가 발생했습니다. 데이터를 불러올 수 없습니다.</div>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return <PostEditor initialData={initialData} />;
}
export default EditorPageClient;
