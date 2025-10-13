import { ApiResponse } from '@/@types/type';
import api from '@/utils/api';

export interface TodoItem {
  id: number;
  description: string;
  isComplete: boolean;
  date: string; // 'YYYY-MM-DD' 형식
}

// GET: 날짜별 할 일 조회
export async function getTodosByDate(date: string): Promise<TodoItem[]> {
  const { data: response } = await api.get<ApiResponse<TodoItem[]>>(`/api/todos`, {
    params: { date },
  });
  return response.data || [];
}

// POST: 새 할 일 추가
export async function createTodo(description: string, date: string): Promise<TodoItem> {
  const response = await api.post<ApiResponse<TodoItem>>(`/api/todos`, {
    description,
    date,
  });
  return response.data.data;
}

// PUT: 할 일 내용/날짜 수정
export async function updateTodo(id: number, description: string, date: string): Promise<TodoItem> {
  const response = await api.put<ApiResponse<TodoItem>>(`/api/todos/${id}`, {
    description,
    date,
  });
  return response.data.data;
}

// PUT: 할 일 상태 토글
export async function toggleTodoStatus(id: number): Promise<TodoItem> {
  const response = await api.put<ApiResponse<TodoItem>>(`/api/todos/${id}/toggle`);
  return response.data.data;
}

// DELETE: 할 일 삭제
export async function deleteTodo(id: number): Promise<void> {
  await api.delete<ApiResponse<string>>(`/api/todos/${id}`);
}
