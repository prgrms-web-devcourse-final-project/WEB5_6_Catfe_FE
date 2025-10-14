import { RawDayPlan } from '@/@types/planner';
import { useDayPlans } from './usePlanner';
import { useMemo, useState } from 'react';
import { getPlanTodoStatus, togglePlanTodoStatus } from '@/utils/storeTodo';

export type HomeTodoItem = RawDayPlan & {
  isComplete: boolean;
};

/* 서버의 DayPlans 데이터에 로컬 스토리지의 완료 상태를 병합 */
export function useMyHomeTodo(ymd: string) {
  const { data: plannerData, isLoading, isError, error } = useDayPlans(ymd);
  // 강제 리랜더링용
  const [toggleCount, setToggleCount] = useState(0);

  const todos: HomeTodoItem[] = useMemo(() => {
    if (isLoading || !plannerData || !plannerData.data.plans || toggleCount < 0) {
      return [];
    }
    const rawPlans = plannerData.data.plans as RawDayPlan[];
    return rawPlans.map((todo) => ({
      ...todo,
      isComplete: getPlanTodoStatus(ymd, todo.id), // 로컬 스토리지 상태 주입
    }));
  }, [plannerData, isLoading, ymd, toggleCount]);

  const toggleTodoStatus = (todoId: number) => {
    togglePlanTodoStatus(ymd, todoId);
    setToggleCount((prev) => prev + 1);
  };

  return {
    todos,
    isLoading,
    isError,
    error,
    toggleTodoStatus,
  };
}
