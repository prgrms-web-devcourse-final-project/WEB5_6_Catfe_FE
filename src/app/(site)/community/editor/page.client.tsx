'use client';

import { useSearchParams } from 'next/navigation';
import { useCategoriesQuery, usePost, usePostMutations } from '@/hook/community/useCommunityPost';
import Spinner from '@/components/Spinner';
import PostEditor from '@/components/community/PostEditor';

function EditorPageClient() {
  const searchParams = useSearchParams();
  const postId = Number(searchParams.get('id'));
  const isEditMode = !!postId;
  const existingPostId = postId || undefined;
  const { mutateAsync: onSubmitAction } = usePostMutations(isEditMode, existingPostId);

  const { data: initialData, isLoading: isLoadingPost } = usePost(postId || 0);
  const { data: categoryData, isLoading: isLoadingCategories } = useCategoriesQuery();

  if (isLoadingPost || isLoadingCategories) {
    return <Spinner />;
  }

  return (
    <PostEditor
      initialData={initialData}
      categoryData={categoryData || []}
      onSubmitAction={onSubmitAction}
    />
  );
}
export default EditorPageClient;
