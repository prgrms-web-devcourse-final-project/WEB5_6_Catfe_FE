'use client';

import { DocumentType, Editor, NodeType, TextType } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

type DraftPayload = {
  title: string;
  filterOptions: string[];
  json: DocumentType | NodeType | TextType;
  updatedAt: number;
};

export const isDocEmpty = (editor: Editor) => editor.state.doc.content.size <= 2;
export const isBlank = (s?: string) => !s || s.trim() === '';

export function useEditorDraft(
  title: string,
  filterOptions: string[],
  editor: Editor | null,
  key: string,
  opts: { debounceMs?: number; restoreIfEmpty?: boolean } = {}
) {
  const { debounceMs = 10000, restoreIfEmpty = true } = opts; // 10초에 한 번씩 저장
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftPayload | null>(null);
  const timeRef = useRef<number | null>(null);
  const suspendRef = useRef(false);

  // Restore Draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      const parsed: DraftPayload = JSON.parse(raw);
      // if (!editor) {
      //   setDraft(parsed);
      //   return;
      // }
      // const shouldRestore = restoreIfEmpty
      //   ? isDocEmpty(editor) && isBlank(title) && (filterOptions?.length ?? 0) === 0
      //   : true;

      // if (shouldRestore) {
      setDraft((prev) => {
        if (prev && prev.updatedAt === parsed.updatedAt) return prev;
        return parsed;
      });
      // }

      setLastSavedAt(parsed.updatedAt ?? null);
    } catch (err) {
      console.error('LocalStorage Draft Restore Failed:', err);
    }
  }, [key, restoreIfEmpty]);

  // Save Draft
  useEffect(() => {
    if (!editor) return;
    if (suspendRef.current) return;

    const saveNow = () => {
      try {
        const payload: DraftPayload = {
          title,
          filterOptions: Array.isArray(filterOptions) ? filterOptions.slice(0, 3) : [],
          json: editor.getJSON(),
          updatedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(payload));
        setLastSavedAt(payload.updatedAt);
      } catch (err) {
        console.error('LocalStorage Draft Save Failed:', err);
      }
    };

    // Debounce Scheduler
    const scheduler = () => {
      if (timeRef.current) window.clearTimeout(timeRef.current);
      timeRef.current = window.setTimeout(saveNow, debounceMs);
    };
    scheduler();

    // Editor Update시 Scheduler 갱신
    const onUpdate = () => scheduler();
    editor.on('update', onUpdate);

    // 페이지 이탈 전 저장
    const onBeforeUnload = () => {
      if (timeRef.current) {
        window.clearTimeout(timeRef.current);
        timeRef.current = null;
      }
      try {
        const payload: DraftPayload = {
          title,
          filterOptions: Array.isArray(filterOptions) ? filterOptions.slice(0, 3) : [],
          json: editor.getJSON(),
          updatedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (err) {
        console.error('LocalStorage Draft Save Failed:', err);
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      editor.off('update', onUpdate);
      window.removeEventListener('beforeunload', onBeforeUnload);
      if (timeRef.current) {
        window.clearTimeout(timeRef.current);
        timeRef.current = null;
      }
    };
  }, [title, filterOptions, editor, key, debounceMs]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
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

  return { lastSavedAt, draft, clearDraft, runWithoutSaving };
}
