'use client';

import { Editor, EditorContent, JSONContent, useEditor } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import showToast from '@/utils/showToast';
import Button from '../Button';
import Toolbar from './Toolbar';
import { isDocEmpty, useEditorDraft } from '@/hook/community/useEditorDraft';
import SubjectCombobox from './SubjectCombobox';
import DemographicSelect from './DemographicSelect';
import GroupSizeSelect from './GroupSizeSelect';
import { CategoryItem, CreatePostRequest, InitialPost, PostDetail } from '@/@types/community';
import { TIPTAP_EXTENSIONS } from '@/lib/tiptapExtensions';
import { safeSanitizeHtml } from '@/utils/safeSanitizeHtml';
import { ApiResponse } from '@/@types/type';
import { useCategoryRegisterMutation } from '@/hook/community/useCommunityPost';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/hook/useConfirm';
import { useMutation } from '@tanstack/react-query';
import { apiUploadFile } from '@/api/apiFile';
import fileToDataUrl from '@/utils/fileToDataUrl';

type EditorProps = {
  initialData?: InitialPost;
  categoryData: CategoryItem[];
  onSubmitAction?: (data: CreatePostRequest) => Promise<ApiResponse<PostDetail>>;
};

function PostEditor({ initialData, categoryData, onSubmitAction }: EditorProps) {
  const isEditMode = !!initialData;
  const postId = initialData?.postId;
  const router = useRouter();
  const confirm = useConfirm();

  const DRAFT_KEY = isEditMode ? `draft:community:post:${postId}` : `draft:community:new`;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<Editor | null>(null);

  const { mutateAsync: registerCategory } = useCategoryRegisterMutation();

  const uploadMutation = useMutation({
    mutationFn: apiUploadFile,
    onError: (err: Error) => {
      console.error('이미지 업로드 실패:', err.message);
      showToast('error', '이미지 업로드에 실패했습니다.');
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      const base64Url = await fileToDataUrl(file);
      editor.chain().focus().setImage({ src: base64Url, alt: file.name }).run();
    } catch (err) {
      showToast('error', '이미지 처리 중 오류가 발생했습니다.');
      console.error('Image Conversion Failed:', err);
    }
  }, []);

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: 'prose max-w-none min-h-[240px] focus:outline-none prose-stone',
      },
      transformPastedHTML: (html: string) => {
        return safeSanitizeHtml(html, true);
      },
      handleDrop: (view: unknown, event: DragEvent) => {
        const hasFiles = event.dataTransfer?.files && event.dataTransfer.files.length > 0;
        if (hasFiles) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view: unknown, event: ClipboardEvent) => {
        const hasFiles = event.clipboardData?.files && event.clipboardData.files.length > 0;
        if (hasFiles) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    }),
    [handleImageUpload]
  );

  const editor = useEditor({
    extensions: TIPTAP_EXTENSIONS,
    content: '',
    autofocus: isEditMode,
    editorProps,
    immediatelyRender: false,
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const categoryOptions = useMemo(() => {
    const subject = categoryData.filter((c) => c.type === 'SUBJECT').map((c) => c.name);
    const demographic = categoryData.filter((c) => c.type === 'DEMOGRAPHIC').map((c) => c.name);
    const groupSize = categoryData.filter((c) => c.type === 'GROUP_SIZE').map((c) => c.name);

    // Name -> ID 맵 (게시 시 사용)
    const nameToId = categoryData.reduce(
      (acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
      },
      {} as Record<string, number>
    );

    return { subject, demographic, groupSize, nameToId };
  }, [categoryData]);

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
    debounceMs: 10000,
  });

  // 초기 데이터 로드
  useEffect(() => {
    if (!editor || editor.options.content) return;

    let contentToLoad: JSONContent | string | null | undefined = initialData?.content;

    // draft 있으면 덮어쓰기
    if (draft && draft.json && !isDocEmpty(draft.json)) {
      contentToLoad = draft.json;
    }

    if (contentToLoad) {
      editor.commands.setContent(contentToLoad);
    }
  }, [editor, initialData?.content, draft]);

  const handleCategoryRegistration = async (name: string) => {
    try {
      const newId = await registerCategory({ name, type: 'SUBJECT' });
      return newId;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editor || submitting) return;
    setSubmitting(true);
    const selectedNames = [categories[0], categories[1], categories[2]].filter(Boolean) as string[];

    let subjectId: number | null = null;
    const subjectName = selectedNames[0];

    if (subjectName) {
      subjectId = categoryOptions.nameToId[subjectName] ?? null;

      // 맵에 ID가 없고, Subject 필드라면 신규 등록 시도
      if (!subjectId) {
        showToast('info', `[${subjectName}]을 등록 중입니다.`);
        const newId = await handleCategoryRegistration(subjectName);
        if (newId) {
          subjectId = newId;
        } else {
          showToast('error', `과목 등록에 실패했습니다. (${subjectName})`);
          setSubmitting(false);
          return;
        }
      }
    }
    // 나머지 카테고리 ID 수집 (Set을 사용하여 중복 자동 제거)
    const collectedIds = new Set<number>();
    if (subjectId) {
      collectedIds.add(subjectId);
    }
    // Age (categories[1])와 Headcount (categories[2]) 처리
    for (let i = 1; i < selectedNames.length; i++) {
      const name = selectedNames[i];
      const id = categoryOptions.nameToId[name];
      if (id) {
        collectedIds.add(id);
      }
    }
    const finalCategoryIds = Array.from(collectedIds);

    if (finalCategoryIds.length === 0) {
      showToast('error', '과목, 연령대, 인원수 중 하나 이상 선택(입력)이 필요합니다.');
      setSubmitting(false);
      return;
    }

    let finalHtml = editor.getHTML();
    const base64Regex = /data:image\/[^;]+;base64,([a-zA-Z0-9+/=]+)/g;
    const base64Images = Array.from(finalHtml.matchAll(base64Regex));

    if (base64Images.length > 0) {
      const uploadPromises = base64Images.map(async (match) => {
        const base64Src = match[0];

        // Base64 Data URL을 Blob으로 변환 후 File 객체 생성
        const blob = await fetch(base64Src).then((res) => res.blob());
        const fileType = blob.type.split('/')[1] || 'png';
        const file = new File([blob], `uploaded_image.${fileType}`, { type: blob.type });

        // 파일 업로드 API 호출
        const newUrl = await uploadMutation.mutateAsync(file);
        return { oldSrc: base64Src, newSrc: newUrl };
      });

      try {
        const results = await Promise.all(uploadPromises);

        // 업로드된 새 URL로 HTML 내용 교체
        results.forEach(({ oldSrc, newSrc }) => {
          finalHtml = finalHtml.replace(new RegExp(oldSrc, 'g'), newSrc);
        });
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        setSubmitting(false);
        return;
      }
    }

    // Request Body 생성
    const requestBody: CreatePostRequest = {
      title: title,
      content: finalHtml,
      categoryIds: finalCategoryIds,
    };

    try {
      if (onSubmitAction) {
        const res = await onSubmitAction(requestBody);
        if (res?.success) {
          showToast(
            'success',
            isEditMode ? '게시글이 수정되었습니다.' : '게시글이 게시되었습니다.'
          );
          clearDraft();
          const targetId = res.data.postId || postId;
          if (targetId) router.push(`/community/${targetId}`);
          else router.push('/community');
        } else {
          showToast('error', '저장에 실패했습니다. 다시 시도해 주세요.');
          console.error(res?.message);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const confirmOk = await confirm({
      title: '작성을 취소하시겠습니까?',
      description: <>작성 중인 내용이 모두 사라집니다.</>,
      confirmText: '취소하기',
      cancelText: '돌아가기',
      tone: 'danger',
    });
    if (!confirmOk) return;

    runWithoutSaving(() => {
      setTitle('');
      setCategories([]);
      editor?.chain().focus().clearContent().run();
      clearDraft();
    });
    history.back();
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
        onSubmit={handleSubmit}
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
              options={categoryOptions.subject}
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
              options={categoryOptions.demographic}
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
              options={categoryOptions.groupSize}
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
