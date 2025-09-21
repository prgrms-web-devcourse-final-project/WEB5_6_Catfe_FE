'use client';

import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useRef, useState } from 'react';
import showToast from '@/utils/showToast';
import Button from '../Button';
import Toolbar from './Toolbar';

type EditorProps = {
  onSubmitAction?: (data: FormData) => Promise<{ ok: boolean; id?: string; error?: string }>;
};
// Promise Props 는 API 명세에 따라 수정 필요

function CommunityEditor({ onSubmitAction }: EditorProps) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        protocols: ['http', 'https', 'mailto'],
      }),
      Image.configure({ allowBase64: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: '모집글 내용을 작성해주세요.',
      }),
    ],
    content: '',
    autofocus: true,
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[240px] focus:outline-none prose-stone',
      },
    },
    immediatelyRender: false,
  });

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
    }
  };

  const handleCancel = () => {
    const confirmOk = confirm('입력된 내용이 모두 사라집니다. 정말 취소하시겠습니까?');
    if (confirmOk) {
      history.back();
    }
  };

  return (
    <div className="bg-background-white border-2 border-secondary-900 rounded-2xl flex flex-col items-center justify-start gap-6 p-6 w-full">
      <h3 className="font-bold text-xl sm:text-2xl w-full text-left">그룹 모집글 작성</h3>
      <form className="flex flex-col gap-4 w-full editor" ref={formRef} action={handleSubmit}>
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
              className="w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-400"
              required
            />
          </div>
          {/* 옵션 1 */}
          <div className="flex flex-col w-1/2 gap-2">
            <label htmlFor="filter1" className="text-xs">
              Filter Option 1
            </label>
            <input
              type="text"
              name="filter1"
              id="filter1"
              className="w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-400"
            />
          </div>
        </div>
        <div className="flex w-full gap-4">
          {/* 옵션 2 */}
          <div className="flex flex-col w-1/2 gap-2">
            <label htmlFor="filter2" className="text-xs">
              Filter Option 2
            </label>
            <input
              type="text"
              name="filter2"
              id="filter2"
              placeholder=""
              className="w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-400"
            />
          </div>
          {/* 옵션 3 */}
          <div className="flex flex-col w-1/2 gap-2">
            <label htmlFor="filter3" className="text-xs">
              Filter Option 3
            </label>
            <input
              type="text"
              name="filter3"
              id="filter3"
              className="w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-400"
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
            게시하기
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
export default CommunityEditor;
