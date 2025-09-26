import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

export const TIPTAP_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
  }),
  Underline,
  Link.configure({
    openOnClick: true,
    autolink: false,
    protocols: ['http', 'https', 'mailto'],
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),
  Image.configure({ allowBase64: true }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right'],
  }),
];
