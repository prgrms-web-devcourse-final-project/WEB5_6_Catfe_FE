import { useEffect, useMemo, useRef, useState } from 'react';

export interface CommentTarget {
  postId: number;
  parentCommentId?: number;
}

const TEXT_LIMIT = 3000; // 이건 be와 얘기해보고 조정
const MAX_HEIGHT = 220;

export function useCommentEditor({
  target,
  onSubmit,
}: {
  target: CommentTarget;
  onSubmit: (data: { postId: number; parentCommentId?: number; content: string }) => Promise<void>;
}) {
  const { parentCommentId } = target;
  const isReply = !!parentCommentId;

  const [value, setValue] = useState<string>('');
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
    resize();
  }, [value]);

  // 글자수 제한 초과 검사
  const trimmed = useMemo(() => value.trim(), [value]);
  const overLimit = value.length > TEXT_LIMIT;
  const disabled = submitting || trimmed.length === 0 || overLimit;

  // submit
  const submitComment = async () => {
    if (disabled) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...target, content: trimmed });
      setValue('');
    } catch (err) {
      console.error('댓글 등록 실패:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    if (trimmed.length === 0) {
      return;
    }
    const confirmOk = confirm('입력된 내용이 모두 사라집니다. 정말 취소하시겠습니까?');
    if (confirmOk) {
      setValue('');
      requestAnimationFrame(resize);
    }
  };

  // keyboard handler (shift+Enter 개행 / Enter or Cmd+Enter 시 submit / ESC 취소)
  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
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
    cancel,
    contentLength,
    limit: TEXT_LIMIT,
  };
}
