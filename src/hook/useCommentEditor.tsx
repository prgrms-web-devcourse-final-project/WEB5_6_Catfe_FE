import { useEffect, useMemo, useRef, useState } from 'react';
import { useConfirm } from './useConfirm';

export interface CommentTarget {
  postId: number;
  parentCommentId?: number;
  commentId?: number; // 수정용
}

interface CommentEditorProps {
  target: CommentTarget;
  onSubmit: (data: { postId: number; parentCommentId?: number; content: string }) => Promise<void>;
  initialContent?: string;
  isEditMode?: boolean;
  onCancel?: () => void;
}

const TEXT_LIMIT = 3000; // 이건 be와 얘기해보고 조정
const MAX_HEIGHT = 220;

export function useCommentEditor({
  target,
  onSubmit,
  initialContent = '',
  isEditMode = false,
  onCancel,
}: CommentEditorProps) {
  const { parentCommentId } = target;
  const isReply = !!parentCommentId;

  const confirm = useConfirm();
  const [value, setValue] = useState<string>(initialContent);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // textarea 크기 조절
  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  useEffect(() => {
    if (isEditMode) {
      setValue(initialContent);
    }
    resize();
  }, [initialContent, isEditMode]);

  // 글자수 제한 초과 검사
  const trimmed = useMemo(() => value.trim(), [value]);
  const overLimit = value.length > TEXT_LIMIT;
  const isContentUnchanged = isEditMode && trimmed === initialContent.trim();
  const disabled = submitting || trimmed.length === 0 || overLimit || isContentUnchanged;

  // submit
  const submitComment = async () => {
    if (disabled) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...target, content: trimmed });
      if (!isEditMode) {
        setValue('');
      } else {
        onCancel?.();
      }
    } catch (err) {
      console.error('댓글 등록 실패:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelCreation = async () => {
    if (trimmed.length === 0) {
      return;
    }
    const confirmOk = await confirm({
      title: '댓글 작성을 취소하시겠습니까?',
      description: <>입력된 내용이 모두 사라집니다.</>,
      confirmText: '취소하기',
      cancelText: '돌아가기',
      tone: 'danger',
    });

    if (confirmOk) {
      setValue('');
      requestAnimationFrame(resize);
    }
  };

  const handleCancel = isEditMode ? onCancel : cancelCreation;

  // keyboard handler (shift+Enter 개행 / Enter or Cmd+Enter 시 submit / ESC 취소)
  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel?.();
      return;
    }

    const submitKey = (e.metaKey || e.ctrlKey) && e.key === 'Enter';
    const newLine = e.shiftKey && e.key === 'Enter';

    if (submitKey) {
      e.preventDefault();
      void submitComment();
      return;
    }
    if (!newLine && e.key === 'Enter') {
      e.preventDefault();
      void submitComment();
    }
  };

  const contentLength = value.length;

  return {
    isReply,
    editorId: `cmt-${parentCommentId ?? 'root'}`,
    value,
    setValue,
    submitting,
    disabled,
    textareaRef,
    resize,
    handleKeyDown,
    submitComment,
    cancel: handleCancel,
    contentLength,
    limit: TEXT_LIMIT,
    isEditMode,
  };
}
