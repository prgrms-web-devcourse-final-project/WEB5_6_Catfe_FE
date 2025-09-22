import { Editor } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

export type HeadingLevel = 0 | 2 | 3 | 4;
export type AlignText = 'left' | 'center' | 'right' | null;

export type ToolbarSnapshot = {
  heading: HeadingLevel;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  link: boolean;
  bulletList: boolean;
  orderedList: boolean;
  align: AlignText;
  canBold: boolean;
  canItalic: boolean;
  canUnderline: boolean;
  canStrike: boolean;
};

const initSnap: ToolbarSnapshot = {
  heading: 0,
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  link: false,
  bulletList: false,
  orderedList: false,
  align: null,
  canBold: false,
  canItalic: false,
  canUnderline: false,
  canStrike: false,
};

function isEqualState(a: ToolbarSnapshot, b: ToolbarSnapshot) {
  return (
    a.heading === b.heading &&
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strike === b.strike &&
    a.link === b.link &&
    a.bulletList === b.bulletList &&
    a.orderedList === b.orderedList &&
    a.align === b.align &&
    a.canBold === b.canBold &&
    a.canItalic === b.canItalic &&
    a.canUnderline === b.canUnderline &&
    a.canStrike === b.canStrike
  );
}

export function useToolbarSnapshot(editor: Editor | null) {
  const [snapshot, setSnapshot] = useState<ToolbarSnapshot>(initSnap);
  const prev = useRef<ToolbarSnapshot>(initSnap);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!editor) return;

    // 이전 상태와 같은지 계산
    const compute = () => {
      const heading =
        ([2, 3, 4] as const).find((lv) => editor.isActive('heading', { level: lv })) ?? 0;

      const next: ToolbarSnapshot = {
        heading,
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        strike: editor.isActive('strike'),
        link: editor.isActive('link'),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
        align: editor.isActive({ textAlign: 'left' })
          ? 'left'
          : editor.isActive({ textAlign: 'center' })
            ? 'center'
            : editor.isActive({ textAlign: 'right' })
              ? 'right'
              : null,
        canBold: !!editor.can().chain().focus().toggleBold().run(),
        canItalic: !!editor.can().chain().focus().toggleItalic().run(),
        canUnderline: !!editor.can().chain().focus().toggleUnderline().run(),
        canStrike: !!editor.can().chain().focus().toggleStrike().run(),
      };

      if (!isEqualState(prev.current, next)) {
        prev.current = next;
        setSnapshot(next);
      }
    };

    // 반복 주기 = 프레임 당
    const repeatSchedule = () => {
      if (raf.current !== null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        compute();
      });
    };

    // 이벤트 구독
    compute();
    editor.on('selectionUpdate', repeatSchedule);
    editor.on('update', repeatSchedule);

    return () => {
      editor.off('selectionUpdate', repeatSchedule);
      editor.off('update', repeatSchedule);

      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [editor]);

  return snapshot;
}
