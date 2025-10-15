import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import ContentsDetail from './ContentsDetail';
import api from '@/utils/api';
import { ApiResponse } from '@/@types/type';
import { PostDetail } from '@/@types/community';
import { communityQueryKey, getPostDetail } from '@/hook/community/useCommunityPost';

async function getPostDetailForServer(id: number): Promise<{ title?: string } | null> {
  try {
    const response = await api.get<ApiResponse<PostDetail>>(`/api/posts/${id}`);
    if (response.data.success && response.data.data) {
      return { title: response.data.data.title };
    }
    return null;
  } catch (error) {
    console.error(`Fetch Error - Post Title for Metadata: ${id}`, error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postData = await getPostDetailForServer(Number(id));
  const postTitle = postData?.title;

  return {
    title: postTitle ? `Catfé | ${postTitle}` : `Catfé | Community Post #${id}`,
  };
}

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: communityQueryKey.post(postId, 'anon'),
    queryFn: () => getPostDetail(postId),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="min-h-dvh mx-auto max-w-[1200px] flex justify-center items-start py-8">
        <div className="w-7/8 rounded-2xl border-2 border-secondary-900 p-8 mx-auto">
          <ContentsDetail postId={postId} />
        </div>
      </div>
    </HydrationBoundary>
  );
}
export default Page;
