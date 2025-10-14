'use client';

import { HomeTodoItem, useMyHomeTodo } from '@/hook/useMyHomeTodo';
import { formatToYMD } from '@/lib/datetime';
import Link from 'next/link';

function MyHomeTodo() {
  const ymd = formatToYMD(Date.now());
  const { todos, isLoading, isError, toggleTodoStatus } = useMyHomeTodo(ymd);

  return (
    <div className="p-4 h-full  bg-background-white rounded-2xl border-2 border-secondary-600 shadow-md overflow-hidden flex flex-col gap-2">
      <h3 className="text-lg font-bold mb-4">{ymd} 공부 계획</h3>
      {/* 할 일 목록 */}
      <div className="flex-1 overflow-auto">
        {isError && (
          <p className="text-red-500 mb-3 p-2 border border-red-300 bg-red-50 rounded">
            데이터 로딩 중 오류가 발생했어요 🥹
          </p>
        )}
        {isLoading ? (
          <p className="text-center text-gray-500">로딩 중...</p>
        ) : (
          <ul className="space-y-3 mx-1 h-full">
            {todos.length === 0 ? (
              <p className="text-center text-gray-500 h-full w-full font-light flex items-center justify-center">
                오늘의 공부 계획을 등록해보세요.
              </p>
            ) : (
              todos.map((todo: HomeTodoItem) => (
                <li
                  key={todo.id}
                  className={`flex items-center p-3 border rounded-md transition duration-200 ${
                    todo.isComplete ? 'bg-primary-50' : 'bg-background-white hover:shadow-sm'
                  }`}
                >
                  {/* 체크박스 (상태 토글) */}
                  <input
                    type="checkbox"
                    checked={todo.isComplete}
                    onChange={() => toggleTodoStatus(todo.id)}
                    className="w-5 h-5 accent-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 mr-3 cursor-pointer"
                  />
                  {/* 할 일 내용 */}
                  <span
                    className={`flex-grow ${
                      todo.isComplete ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {todo.subject}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <hr className="border-secondary-600 border my-2" />

      <Link
        href={`/mypage/planner?date=${ymd}`}
        className="text-sm text-secondary-700 mx-auto underline underline-offset-4"
      >
        스터디플래너로 이동
      </Link>
    </div>
  );
}

export default MyHomeTodo;
