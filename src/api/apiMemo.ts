import { ApiResponse } from '@/@types/type';
import api from '@/utils/api';

type MemoResponse = {
  id: number;
  description: string;
  date: string;
};

export async function getMemo(ymd: string): Promise<string> {
  try {
    const { data: res } = await api.get<ApiResponse<MemoResponse>>(`/api/memos`, {
      params: { date: ymd },
    });
    if (!res.data || !res.data.description) {
      return ''; // 빈 메모로 처리
    }
    return res.data.description;
  } catch (err) {
    throw new Error(`메모 조회에 실패했습니다: ${err}`);
  }
}

export async function saveMemo(ymd: string, description: string): Promise<void> {
  await api.post('/api/memos', {
    date: ymd,
    description,
  });
}
