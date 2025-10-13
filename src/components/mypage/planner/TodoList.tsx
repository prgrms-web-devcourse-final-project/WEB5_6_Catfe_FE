'use client';

import Button from '@/components/Button';
import { useTodoList } from '@/hook/useTodoList';
import Image from 'next/image';
import { useState } from 'react';

function TodoList() {
  const [newTodoText, setNewTodoText] = useState('');

  const {
    todos,
    isLoading,
    isError,
    error,
    createTodo,
    isCreating,
    toggleTodoStatus,
    togglingId,
    deleteTodo,
    deletingId,
  } = useTodoList();

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = newTodoText.trim();
    if (trimmedText) {
      createTodo(trimmedText);
      setNewTodoText('');
    }
  };

  return (
    <div className="p-4 h-full bg-background-white border border-secondary-900 rounded-xl shadow-md overflow-hidden flex flex-col gap-2">
      <h3 className="text-lg font-bold mb-4">To Do List</h3>
      {/* 할 일 목록 */}
      <div className="flex-1 overflow-auto">
        {isError && (
          <p className="text-red-500 mb-3 p-2 border border-red-300 bg-red-50 rounded">
            데이터 로딩 오류: {error?.message}
          </p>
        )}
        {isLoading ? (
          <p className="text-center text-gray-500">로딩 중...</p>
        ) : (
          <ul className="space-y-3 mx-1">
            {todos.length === 0 ? (
              <p className="text-center text-gray-500 h-full font-light">
                오늘의 할 일을 등록해보세요.
              </p>
            ) : (
              todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center p-3 border rounded-md transition duration-200 ${
                    todo.isComplete ? 'bg-primary-50' : 'bg-background-white hover:shadow-sm'
                  } ${
                    // 현재 뮤테이션 중인 항목에만 투명도 적용
                    togglingId === todo.id || deletingId === todo.id ? 'opacity-50' : ''
                  }`}
                >
                  {/* 체크박스 (상태 토글) */}
                  <input
                    type="checkbox"
                    checked={todo.isComplete}
                    onChange={() => toggleTodoStatus(todo.id)}
                    className="w-5 h-5 accent-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 mr-3 cursor-pointer"
                    disabled={togglingId === todo.id}
                  />
                  {/* 할 일 내용 */}
                  <span
                    className={`flex-grow ${
                      todo.isComplete ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {todo.description}
                  </span>
                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    aria-label="댓글 삭제"
                    className="cursor-pointer"
                    disabled={deletingId === todo.id}
                  >
                    <Image
                      src="/icon/community/trash.svg"
                      alt=""
                      width={14}
                      height={14}
                      unoptimized
                      priority={false}
                    />
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <hr className="border-secondary-900 my-1" />
      {/* 할 일 추가 폼 */}
      <form onSubmit={handleAddTodo} className="w-full flex gap-2">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="새 할 일을 입력하세요"
          className="w-11/12 p-2 border border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-400"
          disabled={isLoading || isCreating}
        />
        <Button
          type="submit"
          borderType="solid"
          color="primary"
          size="sm"
          className="h-full"
          disabled={isLoading || isCreating || !newTodoText.trim()}
        >
          {isCreating ? '추가 중...' : '추가'}
        </Button>
      </form>
    </div>
  );
}

export default TodoList;
