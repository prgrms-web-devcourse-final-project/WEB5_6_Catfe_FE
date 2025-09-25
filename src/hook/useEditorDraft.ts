'use client';

import { InitialPost } from '@/@types/community';
import { DocumentType, Editor, JSONContent, NodeType, TextType } from '@tiptap/react';
import { Transaction } from '@tiptap/pm/state';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type DraftPayload = {
  title: string;
  categories: string[];
  json: DocumentType | NodeType | TextType;
  updatedAt: number;
};

export const isDocEmpty = (jsonContent: JSONContent | null | undefined): boolean => {
  if (!jsonContent || !jsonContent.content) return true;
  const content = jsonContent.content;

  // tiptap이 기본적으로 만드는 빈 문서 paragraph
  if (content.length === 1) {
    // 유일한 node가 <p>이고 children이 없으면 비어있음
    if (content[0].type === 'paragraph') {
      return !content[0].text && !content[0].content;
    }
  }
  return false;
};

export const isBlank = (s?: string) => !s || s.trim() === '';

export function useEditorDraft(
  editor: Editor | null,
  draftKey: string,
  initialData?: InitialPost,
  opts: { debounceMs?: number; restoreIfEmpty?: boolean } = {}
) {
  const initialTitle = initialData?.title ?? '';
  const initialCategories = useMemo(() => initialData?.categories ?? [], [initialData?.categories]);

  const { debounceMs = 10000, restoreIfEmpty = true } = opts; // 10초에 한 번씩 저장
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftPayload | null>(null);
  const [title, setTitle] = useState<string>(initialTitle);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const timeRef = useRef<number | null>(null);
  const suspendRef = useRef(false);

  // Restore Draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;

      const parsed: DraftPayload = JSON.parse(raw);
      setTitle(parsed.title ?? initialTitle);
      setCategories(parsed.categories ?? initialCategories);
      setDraft((prev) => {
        if (prev && prev.updatedAt === parsed.updatedAt) return prev;
        return parsed;
      });

      setLastSavedAt(parsed.updatedAt ?? null);
    } catch (err) {
      console.error('LocalStorage Draft Restore Failed:', err);
    }
  }, [draftKey, initialTitle, initialCategories, restoreIfEmpty]);

  // Process Draft
  const processDraft = useCallback(
    (isUnload = false) => {
      if (!editor) return;

      const isContentEmpty = isDocEmpty(editor.getJSON());
      const isHeaderEmpty = isBlank(title) && categories.every(isBlank);

      try {
        // 빈 문서일 경우 기존 드래프트 삭제
        if (isHeaderEmpty && isContentEmpty) {
          localStorage.removeItem(draftKey);
          setDraft(null);
          setLastSavedAt(null);
          return;
        }

        // 내용이 있을 때만 저장
        const payload: DraftPayload = {
          title,
          categories: Array.isArray(categories) ? categories.slice(0, 3) : [],
          json: editor.getJSON(),
          updatedAt: Date.now(),
        };
        localStorage.setItem(draftKey, JSON.stringify(payload));

        if (!isUnload) {
          setLastSavedAt(payload.updatedAt);
        }
      } catch (err) {
        console.error('LocalStorage Draft Remove Failed:', err);
        return;
      }
    },
    [editor, title, categories, draftKey]
  );

  // Save Draft
  useEffect(() => {
    if (!editor) return;
    if (suspendRef.current) return;

    const saveNow = () => processDraft(false);

    // Debounce Scheduler
    const scheduler = () => {
      if (timeRef.current) window.clearTimeout(timeRef.current);
      timeRef.current = window.setTimeout(saveNow, debounceMs);
    };
    scheduler();

    // Editor Update시 Scheduler 갱신
    const onTransaction = ({ transaction }: { transaction: Transaction }) => {
      if (transaction.docChanged) scheduler();
    };
    editor.on('transaction', onTransaction);

    // 페이지 이탈 전 저장
    const onBeforeUnload = () => {
      if (timeRef.current) {
        window.clearTimeout(timeRef.current);
        timeRef.current = null;
      }
      processDraft(true);
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      editor.off('transaction', onTransaction);
      window.removeEventListener('beforeunload', onBeforeUnload);
      if (timeRef.current) {
        window.clearTimeout(timeRef.current);
        timeRef.current = null;
      }
    };
  }, [title, categories, editor, draftKey, debounceMs, processDraft]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } finally {
      setLastSavedAt(null);
      setDraft(null);
    }
  };

  const runWithoutSaving = (fn: () => void) => {
    suspendRef.current = true;
    try {
      fn();
    } finally {
      suspendRef.current = false;
    }
  };

  return {
    lastSavedAt,
    draft,
    clearDraft,
    runWithoutSaving,
    title,
    categories,
    setTitle,
    setCategories,
  };
}
