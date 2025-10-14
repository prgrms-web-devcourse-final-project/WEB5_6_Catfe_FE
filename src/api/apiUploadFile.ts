import { ApiResponse } from '@/@types/type';
import api from '@/utils/api';

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
