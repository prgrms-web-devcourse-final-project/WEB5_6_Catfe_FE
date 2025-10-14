import { useCategoryOptions } from '@/hook/community/useCategoryOptions';
import showToast from './showToast';
import { useMutation } from '@tanstack/react-query';

interface CategoryProcessResult {
  categoryIds: number[];
  error: string | null;
}

/* 카테고리 이름 목록을 ID 목록으로 변환하고, 신규 카테고리 등록 처리 */
export async function processCategories(
  selectedNames: string[],
  categoryOptions: ReturnType<typeof useCategoryOptions>,
  handleCategoryRegistration: (name: string) => Promise<number | null>
): Promise<CategoryProcessResult> {
  let subjectId: number | null = null;
  const subjectName = selectedNames[0];

  if (subjectName) {
    subjectId = categoryOptions.nameToId[subjectName] ?? null;

    // 맵에 ID가 없고, Subject 필드라면 신규 등록 시도
    if (!subjectId) {
      showToast('info', `[${subjectName}]을 등록 중입니다.`);
      const newId = await handleCategoryRegistration(subjectName);
      if (newId) {
        subjectId = newId;
      } else {
        return { categoryIds: [], error: `과목 등록에 실패했습니다. (${subjectName})` };
      }
    }
  }
  // 나머지 카테고리 ID 수집 (Set을 사용하여 중복 자동 제거)
  const collectedIds = new Set<number>();
  if (subjectId) {
    collectedIds.add(subjectId);
  }
  // Age (categories[1])와 Headcount (categories[2]) 처리
  for (let i = 1; i < selectedNames.length; i++) {
    const name = selectedNames[i];
    const id = categoryOptions.nameToId[name];
    if (id) {
      collectedIds.add(id);
    }
  }
  const finalCategoryIds = Array.from(collectedIds);

  if (finalCategoryIds.length === 0) {
    return { categoryIds: [], error: '과목, 연령대, 인원수 중 하나 이상 선택(입력)이 필요합니다.' };
  }
  return { categoryIds: finalCategoryIds, error: null };
}

/* Base64 이미지를 찾아 서버에 업로드하고, HTML 내용 및 이미지 정보 반환 */
interface ImageProcessResult {
  content: string;
  thumbnailUrl: string | null;
  imageIds: number[];
  error: string | null;
}

export async function processImagesAndContent(
  htmlContent: string,
  uploadMutation: ReturnType<typeof useMutation<{ url: string; attachmentId: number }, Error, File>>
): Promise<ImageProcessResult> {
  let finalHtml = htmlContent;
  const uploadedImages: { url: string; id: number }[] = [];
  const base64Regex = /data:image\/[^;]+;base64,([a-zA-Z0-9+/=]+)/g;
  const base64Images = Array.from(finalHtml.matchAll(base64Regex));

  if (base64Images.length > 0) {
    showToast('info', `${base64Images.length}개의 이미지를 서버에 업로드 중입니다.`);

    const uploadPromises = base64Images.map(async (match) => {
      const base64Src = match[0];

      // Base64 Data URL을 Blob으로 변환 후 File 객체 생성
      const blob = await fetch(base64Src).then((res) => res.blob());
      const fileType = blob.type.split('/')[1] || 'png';
      const file = new File([blob], `uploaded_image.${fileType}`, { type: blob.type });

      // 파일 업로드 API 호출 (apiUploadFile은 { url: string; attachmentId: number } 반환)
      const res = await uploadMutation.mutateAsync(file);

      uploadedImages.push({ url: res.url, id: res.attachmentId });
      return { oldSrc: base64Src, newSrc: res.url };
    });

    try {
      const results = await Promise.all(uploadPromises);

      // 업로드된 새 URL로 HTML 내용 교체
      results.forEach(({ oldSrc, newSrc }) => {
        // 정규식으로 안전하게 모든 Base64 URL을 새 URL로 교체
        finalHtml = finalHtml.replace(
          new RegExp(oldSrc.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
          newSrc
        );
      });
      showToast('success', '이미지 업로드 완료.');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      return {
        content: htmlContent,
        thumbnailUrl: null,
        imageIds: [],
        error: '이미지 업로드 중 오류가 발생하여 게시글 저장을 취소합니다.',
      };
    }
  }

  return {
    content: finalHtml,
    thumbnailUrl: uploadedImages.length > 0 ? uploadedImages[0].url : null,
    imageIds: uploadedImages.map((img) => img.id),
    error: null,
  };
}
