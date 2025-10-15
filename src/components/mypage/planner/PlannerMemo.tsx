'use client';

import { useMemoQuery, useSaveMemoMutation } from '@/hook/usePlannerMemo';
import { useSelectedDate } from '@/hook/useSelectedDate';
import showToast from '@/utils/showToast';
import Image from 'next/image';
import { useEffect, useState } from 'react';

function PlannerMemo() {
  const { ymd } = useSelectedDate();
  const { data: savedMemoContent, isLoading, isError } = useMemoQuery(ymd);
  const { mutate: saveMemo, isPending: isSaving } = useSaveMemoMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>('');
  const [initialContent, setInitialContent] = useState<string>('');

  useEffect(() => {
    if (savedMemoContent !== undefined) {
      setDraft(savedMemoContent);
      setInitialContent(savedMemoContent);
      setIsEditing(false); // 새로운 날짜를 선택하면 자동으로 읽기 모드로 전환
    }
  }, [savedMemoContent]);

  const handleSave = () => {
    // 내용 변경이 없으면 저장하지 않음
    if (draft === initialContent) {
      setIsEditing(false);
      return;
    }

    // 서버에 저장 요청
    saveMemo(
      { ymd, description: draft },
      {
        onSuccess: () => {
          setIsEditing(false);
          setInitialContent(draft);
          showToast('success', '메모를 저장했습니다.');
        },
      }
    );
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // 현재 편집 모드일 경우: '저장' 버튼 클릭
      handleSave();
    } else {
      // 현재 읽기 모드일 경우: '수정' 버튼 클릭
      setIsEditing(true);
    }
  };

  const MemoContent = isEditing ? (
    <textarea
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder="오늘의 메모를 입력해주세요"
      className="w-full h-full rounded-lg border border-zinc-300 p-3 outline-none focus:ring-1 focus:ring-secondary-400 bg-background-white text-sm resize-none"
    />
  ) : (
    <p
      className={`whitespace-pre-wrap text-sm p-3 h-full flex  ${
        draft.length === 0
          ? 'text-gray-400 items-center justify-center'
          : 'text-zinc-700 items-start justify-start'
      }`}
    >
      {draft.length > 0 ? draft : '저장된 메모가 없습니다.'}
    </p>
  );

  return (
    <div className="p-4 h-full bg-background-white border border-secondary-900 rounded-xl shadow-md overflow-hidden flex flex-col gap-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Memo</h3>
        <button
          onClick={handleToggleEdit}
          aria-label={isEditing ? '저장' : '수정'}
          className="cursor-pointer"
        >
          {isSaving ? (
            <span className="text-sm text-secondary-500">저장 중...</span>
          ) : (
            <Image
              src={isEditing ? '/icon/community/save.svg' : '/icon/community/pencil.svg'}
              alt=""
              width={20}
              height={20}
              unoptimized
              priority={false}
            />
          )}
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          메모를 불러오는 중...
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-full text-red-500">
          메모 불러오기 실패 😢
        </div>
      ) : (
        MemoContent
      )}
    </div>
  );
}
export default PlannerMemo;
