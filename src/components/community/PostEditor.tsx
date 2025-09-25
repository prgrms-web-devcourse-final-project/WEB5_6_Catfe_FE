'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import showToast from '@/utils/showToast';
import Button from '../Button';
import Toolbar from './Toolbar';
import { isDocEmpty, useEditorDraft } from '@/hook/useEditorDraft';
import SubjectCombobox from './SubjectCombobox';
import DemographicSelect from './DemographicSelect';
import GroupSizeSelect from './GroupSizeSelect';
import { InitialPost } from '@/@types/community';
import { TIPTAP_EXTENSIONS } from '@/lib/tiptapExtensions';
import { safeSanitizeHtml } from '@/utils/safeSanitizeHtml';

type EditorProps = {
  initialData?: InitialPost;
  onSubmitAction?: (data: FormData) => Promise<{ ok: boolean; id?: string; error?: string }>;
};
// Promise Props 는 API 명세에 따라 수정 필요

function PostEditor({ initialData, onSubmitAction }: EditorProps) {
  const isEditMode = !!initialData;
  const postId = initialData?.post_id;

  const DRAFT_KEY = isEditMode ? `draft:community:post:${postId}` : `draft:community:new`;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: 'prose max-w-none min-h-[240px] focus:outline-none prose-stone',
      },
      transformPastedHTML: (html: string) => {
        return safeSanitizeHtml(html, true);
      },
    }),
    []
  );
  const editor = useEditor({
    extensions: TIPTAP_EXTENSIONS,
    content: '',
    autofocus: isEditMode,
    editorProps,
    immediatelyRender: false,
  });

  // 임시 테스트용 디바운스 짧게 -> 나중에 디바운스 시간 고칠 것
  const {
    lastSavedAt,
    draft,
    clearDraft,
    runWithoutSaving,
    title,
    categories,
    setTitle,
    setCategories,
  } = useEditorDraft(editor, DRAFT_KEY, initialData, {
    debounceMs: 1000,
  });

  // 초기 데이터 로드
  useEffect(() => {
    if (!editor || editor.options.content) return;

    let contentToLoad = initialData?.content;

    // draft 있으면 덮어쓰기
    if (draft && draft.json && !isDocEmpty(draft.json)) {
      contentToLoad = draft.json;
    }
    if (contentToLoad) {
      editor.commands.setContent(contentToLoad);
    }
  }, [editor, initialData?.content, draft]);

  const handleSubmit = async (formData: FormData) => {
    if (!editor) return;
    setSubmitting(true);

    formData.set('content_html', editor.getHTML());
    formData.set('content_json', JSON.stringify(editor.getJSON()));

    try {
      if (onSubmitAction) {
        const res = await onSubmitAction(formData);
        if (!res?.ok) {
          showToast('error', '저장에 실패했습니다.');
          console.error(res.error);
        }
      } else {
        console.log('Submit', Object.fromEntries(formData));
        showToast('success', '테스트용 저장 완료(콘솔 확인)');
      }
    } finally {
      setSubmitting(false);
      runWithoutSaving(() => {
        setTitle('');
        setCategories([]);
        editor?.chain().focus().clearContent().run();
        clearDraft();
      });
    }
  };

  const handleCancel = () => {
    const confirmOk = confirm('입력된 내용이 모두 사라집니다. 정말 취소하시겠습니까?');
    if (confirmOk) {
      runWithoutSaving(() => {
        setTitle('');
        setCategories([]);
        editor?.chain().focus().clearContent().run();
        clearDraft();
      });
      history.back();
    }
  };

  const setFilter = (idx: 0 | 1 | 2, val: string) =>
    setCategories((prev) => {
      const next = [...(prev ?? [])];
      next[idx] = val;
      return next;
    });

  return (
    <div className="bg-background-white border-2 border-secondary-900 rounded-2xl flex flex-col items-center justify-start gap-6 p-6 w-full">
      <h3 className="font-bold text-xl sm:text-2xl w-full text-left">
        {isEditMode ? '그룹 모집글 수정' : '그룹 모집글 작성'}
      </h3>
      <form
        className="flex flex-col gap-4 w-full editor"
        ref={formRef}
        action={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
      >
        <div className="flex w-full gap-4">
          {/* 제목 */}
          <div className="flex flex-col w-1/2 gap-2">
            <label htmlFor="community-title" className="text-xs">
              Title
            </label>
            <input
              type="text"
              name="Title"
              id="community-title"
              placeholder="제목을 입력하세요"
              autoFocus={!isEditMode}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-400"
              required
            />
          </div>
          {/* 옵션 1 */}
          <div className="flex flex-col w-1/2 gap-2">
            <SubjectCombobox
              value={categories[0] ?? ''}
              onChange={(v) => {
                const normalized = Array.isArray(v) ? (v[0] ?? '') : v;
                setFilter(0, normalized);
              }}
              placeholder="공부 과목을 입력하세요"
              allowMultiSelect={false}
              // 원하는 과목이 없으면 직접 입력
              allowCustom={true}
              label="Subject"
            />
          </div>
        </div>
        <div className="flex w-full gap-4">
          {/* 옵션 2 */}
          <div className="flex flex-col w-1/2 gap-2">
            <DemographicSelect
              value={categories[1] ?? ''}
              onChange={(v) => {
                const normalized = Array.isArray(v) ? (v[1] ?? '') : v;
                setFilter(1, normalized);
              }}
              placeholder="연령대 선택..."
              label="Age"
            />
          </div>
          {/* 옵션 3 */}
          <div className="flex flex-col w-1/2 gap-2">
            <GroupSizeSelect
              value={categories[2] ?? ''}
              onChange={(v) => {
                const normalized = Array.isArray(v) ? (v[2] ?? '') : v;
                setFilter(2, normalized);
              }}
              placeholder="모집할 최대 인원 선택..."
              label="Headcount"
            />
          </div>
        </div>
        {/* 본문 에디터 */}
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="contents" className="text-xs">
            Description
          </label>
          <div className="rounded-md border border-gray-300 p-3 max-h-[80vh] overflow-auto">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>
          <input type="hidden" name="content_html" />
          <input type="hidden" name="content_json" />

          {lastSavedAt && (
            <p className="text-gray-400 text-xs">
              {`작성 중인 내용을 임시 저장합니다. (마지막 저장 시간: ${new Date(lastSavedAt).toLocaleTimeString()})`}
            </p>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-2 sm:gap-4 md:gap-6 w-full sm:flex-row items-center justify-center sm:justify-end">
          <Button
            size="md"
            name="intent"
            value="publish"
            disabled={submitting}
            className="!self-center sm:!self-auto w-full sm:w-48"
          >
            {isEditMode ? '수정하기' : '게시하기'}
          </Button>
          <Button
            size="md"
            borderType="outline"
            disabled={submitting}
            onClick={handleCancel}
            className="!self-center sm:!self-auto w-full sm:w-48"
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
export default PostEditor;
