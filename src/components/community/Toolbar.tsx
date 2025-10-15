'use client';

import { Editor } from '@tiptap/react';
import HeadingSelect from './HeadingSelect';
import ToolButton from './ToolButton';
import Image from 'next/image';
import { HeadingLevel, useToolbarSnapshot } from '@/hook/useToolbarSnapshot';
import { useCallback } from 'react';
import fileToDataUrl from '@/utils/fileToDataUrl';
import { MAX_FILE_SIZE } from '@/api/apiUploadFile';
import showToast from '@/utils/showToast';

const Seperator = () => <span className="mx-1 h-5 w-px bg-gray-400" />;

function Toolbar({ editor }: { editor: Editor | null }) {
  const snap = useToolbarSnapshot(editor);

  /* Handler */
  // h1, h2, h3, p 설정
  const onHeadingChange = useCallback(
    (lv: HeadingLevel) => {
      if (!editor) return;
      if (lv === 0) editor.chain().focus().setParagraph().run();
      else editor.chain().focus().toggleHeading({ level: lv }).run();
    },
    [editor]
  );

  // Font Style
  const onBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const onItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const onUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
  const onStrike = useCallback(() => editor?.chain().focus().toggleStrike().run(), [editor]);

  // List Style
  const onBullet = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const onOrdered = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);

  // Text Align
  const onAlignLeft = useCallback(
    () => editor?.chain().focus().setTextAlign('left').run(),
    [editor]
  );
  const onAlignCenter = useCallback(
    () => editor?.chain().focus().setTextAlign('center').run(),
    [editor]
  );
  const onAlignRight = useCallback(
    () => editor?.chain().focus().setTextAlign('right').run(),
    [editor]
  );

  // // Attachment
  // const onSetLink = useCallback(() => {
  //   if (!editor) return;
  //   const prev = editor.getAttributes('link').href as string | undefined;
  //   /*--------------------- 이거 테스트용 prompt 나중에 팝업으로 바꿀것 ------------------*/
  //   const url = window.prompt('URL 입력 for test', prev ?? '');
  //   if (url === null) return;
  //   if (url === '') editor.chain().focus().unsetLink().run();
  //   else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  // }, [editor]);

  const onAttachImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor) return;
      const file = e.target.files?.[0];
      if (!file) return;
      // 파일 크기 검증
      if (file.size > MAX_FILE_SIZE) {
        showToast('error', '파일 크기는 10MB 미만이어야 합니다.');
        e.target.value = '';
        return;
      }
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        showToast('error', '이미지 파일만 업로드하실 수 있습니다.');
        e.target.value = '';
        return;
      }

      const base64file = await fileToDataUrl(file);
      editor.chain().focus().setImage({ src: base64file, alt: file.name }).run();
      e.currentTarget.value = '';
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div
      role="toolbar"
      aria-label="에디터 도구 막대"
      className="flex flex-wrap items-center gap-1 rouunded-md border border-gray-300 bg-secondary-50 px-2 py-1 mb-2 sticky top-0 z-10"
    >
      {/* h1, h2, h3, p 설정 */}
      <HeadingSelect value={snap.heading} onChange={onHeadingChange} labelOffset={1} />

      <Seperator />

      {/* Font Style */}
      <ToolButton onClick={onBold} active={snap.bold} disabled={!snap.canBold} aria-label="굵게">
        <Image
          src="/icon/community/bold.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton>
      <ToolButton
        onClick={onItalic}
        active={snap.italic}
        disabled={!snap.canItalic}
        aria-label="기울임"
      >
        <Image
          src="/icon/community/italic.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton>
      <ToolButton
        onClick={onUnderline}
        active={snap.underline}
        disabled={!snap.canUnderline}
        aria-label="밑줄"
      >
        <Image
          src="/icon/community/underline.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton>
      <ToolButton
        onClick={onStrike}
        active={snap.strike}
        disabled={!snap.canStrike}
        aria-label="취소선"
      >
        <Image
          src="/icon/community/strikethrough.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton>

      <Seperator />

      {/* List Style */}
      <ToolButton onClick={onBullet} active={snap.bulletList} aria-label="글머리 기호 목록">
        <Image
          src="/icon/community/bulletList.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton>
      <ToolButton onClick={onOrdered} active={snap.orderedList} aria-label="번호 매기기 목록">
        <Image
          src="/icon/community/numberList.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton>

      <Seperator />

      {/* Text Align */}
      <ToolButton onClick={onAlignLeft} active={snap.align === 'left'} aria-label="왼쪽 정렬">
        <Image
          src="/icon/community/alignLeft.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton>
      <ToolButton onClick={onAlignCenter} active={snap.align === 'center'} aria-label="가운데 정렬">
        <Image
          src="/icon/community/alignCenter.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton>
      <ToolButton onClick={onAlignRight} active={snap.align === 'right'} aria-label="오른쪽 정렬">
        <Image
          src="/icon/community/alignRight.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton>

      <Seperator />

      {/* Attachment */}
      {/* <ToolButton onClick={onSetLink} active={snap.link} aria-label="링크">
        <Image
          src="/icon/community/link.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
      </ToolButton> */}
      <label
        htmlFor="insert-image"
        className={[
          'px-2 py-1 min-w-8 rounded cursor-pointer inline-flex items-center justify-center',
          'hover:bg-secondary-200',
        ].join(' ')}
      >
        <Image
          src="/icon/community/insertImage.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
          priority={false}
        />
        <input
          type="file"
          id="insert-image"
          accept="image/*"
          className="hidden"
          onChange={onAttachImage}
        />
      </label>
    </div>
  );
}
export default Toolbar;
