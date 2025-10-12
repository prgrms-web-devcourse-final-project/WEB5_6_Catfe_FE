import { ApiResponse } from '@/@types/type';
import api from '@/utils/api';

export interface UploadImageResponseData {
  imageUrl: string;
}

export async function apiUploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('multipartFile', file);
  formData.append('entityType', 'POST');
  const { data: res } = await api.post<ApiResponse<UploadImageResponseData>>(
    '/api/file/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!res.success || !res.data.imageUrl) {
    throw new Error(res.message || '파일 업로드에 실패했습니다.');
  }
  return res.data.imageUrl;
}
