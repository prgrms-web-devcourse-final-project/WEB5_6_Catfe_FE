const STORAGE_PREFIX = 'planner.todo.status_';
const getStorageKey = (ymd: string) => `${STORAGE_PREFIX}${ymd}`;

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

export const cleanupOldPlanTodoStatus = (currentYmd: string) => {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      const storedYmd = key.substring(STORAGE_PREFIX.length);
      if (storedYmd !== currentYmd) {
        keysToRemove.push(key);
      }
    }
  }
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
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
