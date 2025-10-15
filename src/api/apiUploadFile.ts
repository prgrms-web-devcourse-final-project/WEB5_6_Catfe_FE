import { ApiResponse } from '@/@types/type';
import api from '@/utils/api';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 파일 용량 10MB 제한

export interface UploadImageResponseData {
  attachmentId: number;
  publicURL: string;
}

export async function apiUploadFile(file: File): Promise<{ url: string; attachmentId: number }> {
  const formData = new FormData();
  formData.append('multipartFile', file);
  const { data: res } = await api.post<ApiResponse<UploadImageResponseData>>(
    '/api/file/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!res.success || !res.data.publicURL) {
    throw new Error(res.message || '파일 업로드에 실패했습니다.');
  }
  return { url: res.data.publicURL, attachmentId: res.data.attachmentId };
}
