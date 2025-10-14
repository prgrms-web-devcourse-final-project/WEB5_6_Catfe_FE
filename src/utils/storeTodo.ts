const getStorageKey = (ymd: string) => `planner.todo.status${ymd}`;

export const getPlanTodoList = (ymd: string): Record<number, boolean> => {
  if (typeof window === 'undefined') return {};
  const key = getStorageKey(ymd);
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : {};
};

export const savePlanTodoList = (ymd: string, data: Record<number, boolean>) => {
  if (typeof window !== 'undefined') {
    const key = getStorageKey(ymd);
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const getPlanTodoStatus = (ymd: string, todoId: number): boolean => {
  const currentStatuses = getPlanTodoList(ymd);
  return !!currentStatuses[todoId];
};

export const togglePlanTodoStatus = (ymd: string, todoId: number) => {
  const currentStatuses = getPlanTodoList(ymd);
  // 상태를 토글
  const currentState = !!currentStatuses[todoId];
  currentStatuses[todoId] = !currentState;
  savePlanTodoList(ymd, currentStatuses);
};
