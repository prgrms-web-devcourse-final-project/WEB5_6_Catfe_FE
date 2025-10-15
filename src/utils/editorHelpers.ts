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

interface ImageMap {
  url: string;
  attachmentId: number | null;
}

export async function processImagesInContent(
  htmlContent: string,
  uploadMutation: ReturnType<typeof useMutation<ImageMap, Error, File>>
): Promise<ImageProcessResult> {
  let finalHtml = htmlContent;

  const allImagesInOrder: ImageMap[] | null = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const images = doc.querySelectorAll('img');

  images.forEach((img) => {
    const dataId = img.getAttribute('data-id');
    const src = img.getAttribute('src');

    if (!src) return;
    if (src.startsWith('data:')) {
      // Base64 이미지 (새로 추가된 이미지)
      allImagesInOrder.push({ url: src, attachmentId: null });
    } else if (dataId) {
      // 기존 서버 URL 이미지
      allImagesInOrder.push({ url: src, attachmentId: Number(dataId) });
    }
  });
  const imageToUpload = allImagesInOrder.filter((img) => img.attachmentId === null);

  if (imageToUpload.length > 0) {
    showToast('info', `${imageToUpload.length}개의 이미지를 서버에 업로드 중입니다.`);

    const uploadPromises = imageToUpload.map(async (image) => {
      const base64Src = image.url;

      // Base64 Data URL을 Blob으로 변환 후 File 객체 생성
      const blob = await fetch(base64Src).then((res) => res.blob());
      const fileType = blob.type.split('/')[1] || 'png';
      const file = new File([blob], `uploaded_image.${fileType}`, { type: blob.type });

      // 파일 업로드 API 호출
      const res = await uploadMutation.mutateAsync(file);
      return { oldSrc: base64Src, newUrl: res.url, newId: res.attachmentId };
    });

    try {
      const results = await Promise.all(uploadPromises);
      results.forEach(({ oldSrc, newUrl, newId }) => {
        // allImagesInOrder 배열 업데이트
        const index = allImagesInOrder.findIndex((img) => img.url === oldSrc);
        if (index !== -1) {
          allImagesInOrder[index] = { url: newUrl, attachmentId: newId };
        }
        Array.from(images).forEach((img) => {
          const src = img.getAttribute('src');
          if (src === oldSrc) {
            img.setAttribute('src', newUrl);
            img.setAttribute('data-id', newId!.toString());
          }
        });
      });
      showToast('success', '이미지 업로드 완료.');

      finalHtml = doc.body.innerHTML;
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
  const finalImageIds = allImagesInOrder.map((img) => img.attachmentId).filter((id) => id !== null);
  const finalThumbnailUrl = allImagesInOrder.length > 0 ? allImagesInOrder[0].url : null;
  return {
    content: finalHtml,
    thumbnailUrl: finalThumbnailUrl,
    imageIds: finalImageIds,
    error: null,
  };
}
