import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelectedDate } from './useSelectedDate';
import {
  createTodo,
  deleteTodo,
  getTodosByDate,
  TodoItem,
  toggleTodoStatus,
} from '@/api/apiTodoList';

export function useTodoList() {
  const { ymd: selectedDateYMD } = useSelectedDate();
  const queryClient = useQueryClient();

  const queryKey = ['todos', selectedDateYMD];

  // 할 일 목록 조회
  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery<TodoItem[], Error>({
    queryKey,
    queryFn: () => getTodosByDate(selectedDateYMD),
    enabled: !!selectedDateYMD,
  });

  // 새 할 일 추가 (useMutation)
  const createTodoMutation = useMutation({
    mutationFn: (description: string) => createTodo(description, selectedDateYMD),
    onMutate: async (newDescription) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData<TodoItem[]>(queryKey);

      // 낙관적 업데이트
      const tempTodo: TodoItem = {
        id: Date.now(), // 임시 ID
        description: newDescription,
        isComplete: false,
        date: selectedDateYMD,
      };
      queryClient.setQueryData<TodoItem[]>(queryKey, (old) => [...(old || []), tempTodo]);

      return { previousTodos };
    },
    onError: (err, newDescription, context) => {
      console.error(`할 일 추가 실패: ${err.message}`);
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 할 일 상태 토글 (useMutation)
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => toggleTodoStatus(id),
    onMutate: async (idToToggle) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData<TodoItem[]>(queryKey);

      // 낙관적 업데이트
      queryClient.setQueryData<TodoItem[]>(
        queryKey,
        (old) =>
          old?.map((todo) =>
            todo.id === idToToggle ? { ...todo, isComplete: !todo.isComplete } : todo
          ) || []
      );
      return { previousTodos };
    },
    onError: (err, idToToggle, context) => {
      alert(`상태 변경 실패: ${err.message}`);
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 할 일 삭제 (useMutation)
  const deleteTodoMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData<TodoItem[]>(queryKey);

      // 낙관적 업데이트
      queryClient.setQueryData<TodoItem[]>(
        queryKey,
        (old) => old?.filter((todo) => todo.id !== idToDelete) || []
      );
      return { previousTodos };
    },
    onError: (err, idToDelete, context) => {
      alert(`삭제 실패: ${err.message}`);
      if (context?.previousTodos) {
        queryClient.setQueryData(queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    todos: todos || [],
    isLoading,
    isError,
    error,
    createTodo: createTodoMutation.mutate,
    isCreating: createTodoMutation.isPending,
    toggleTodoStatus: toggleStatusMutation.mutate,
    isToggling: toggleStatusMutation.isPending,
    deleteTodo: deleteTodoMutation.mutate,
    isDeleting: deleteTodoMutation.isPending,
    togglingId: toggleStatusMutation.isPending ? (toggleStatusMutation.variables as number) : null,
    deletingId: deleteTodoMutation.isPending ? (deleteTodoMutation.variables as number) : null,
  };
}
