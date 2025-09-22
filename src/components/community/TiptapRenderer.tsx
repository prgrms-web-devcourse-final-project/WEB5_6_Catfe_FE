import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { generateHTML, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import sanitizeHtml from 'sanitize-html';

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
  }),
  Underline,
  Link.configure({
    openOnClick: true,
    autolink: true,
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

interface RendererProps {
  content: JSONContent | string | null;
}

function TiptapRenderer({ content }: RendererProps) {
  if (!content) return null;

  const json: JSONContent =
    typeof content === 'string' ? (JSON.parse(content) as JSONContent) : content;

  const rawHtml = generateHTML(json, extensions);
  const cleanHtml = sanitizeHtml(rawHtml, {
    allowedTags: [
      'h2',
      'h3',
      'h4',
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'ul',
      'ol',
      'li',
      'a',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      p: ['style'],
      h2: ['style'],
      h3: ['style'],
      h4: ['style'],
    },
    allowedStyles: {
      '*': {
        'text-align': [/^left$/, /^center$/, /^right$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
    disallowedTagsMode: 'discard',
  });

  // 이걸 이렇게 해도 되나..????? 다른 방법이 없나????
  return (
    <div
      className="prose prose-stone max-w-none editor"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
export default TiptapRenderer;
