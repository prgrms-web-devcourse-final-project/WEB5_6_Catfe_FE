import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { generateHTML, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useMemo } from 'react';
import sanitizeHtml from 'sanitize-html';
import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
  Text,
} from 'html-react-parser';

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

function isSafeHref(href?: string | null): boolean {
  if (!href) return false;
  try {
    const u = new URL(href, 'http://_base');
    return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function isSafeSrc(src?: string | null, allowData = false): boolean {
  if (!src) return false;
  try {
    const u = new URL(src, 'http://_base');
    if (u.protocol === 'http:' || u.protocol === 'https:') return true;
    if (allowData && u.protocol === 'data:') return true;
    return false;
  } catch {
    return false;
  }
}

function formatAlignToClass(style?: string | null) {
  if (!style) return '';
  const m = style.match(/text-align:\s*(left|center|right)/i);
  if (!m) return '';
  const v = m[1].toLowerCase();
  return v === 'center' ? 'text-center' : v === 'right' ? 'text-right' : 'text-left';
}

function mergeClass(a?: string, b?: string) {
  return [a, b].filter(Boolean).join(' ') || undefined;
}

function isDomNode(node: unknown): node is DOMNode {
  const type = (node as { type?: string } | null)?.type;
  return typeof type === 'string' && type !== 'cdata';
}

function toDomNodes(children: Element['children']): DOMNode[] {
  return children.filter(isDomNode);
}

function createParserOptions(allowDataImage: boolean = false): HTMLReactParserOptions {
  return {
    replace: (node) => {
      // text -> text
      if ((node as Text).type === 'text') return undefined;

      // element
      const el = node as Element;
      if (!el || !el.name) return undefined;

      const tag = el.name.toLowerCase();
      const attribs: Record<string, string> = { ...el.attribs };

      // alignment -> class로 추가하고 나머지 inline style 제거
      const alignClass =
        tag === 'p' || tag === 'h2' || tag === 'h3' || tag === 'h4'
          ? formatAlignToClass(attribs.style)
          : undefined;

      const children =
        el.children && el.children.length
          ? domToReact(toDomNodes(el.children), createParserOptions(allowDataImage))
          : null;

      switch (tag) {
        case 'a': {
          const href = attribs.href;
          if (!isSafeHref(href)) {
            return <>{children}</>;
          }
          const target = attribs.target === '_blank' ? '_blank' : undefined;
          const rel = target ? 'noopener noreferrer' : undefined;
          const aProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
            href,
            target,
            rel,
            title: attribs.title,
            className: mergeClass(attribs.class, attribs.className),
          };
          return React.createElement('a', aProps, children);
        }

        case 'img': {
          const src = attribs.src;
          if (!isSafeSrc(src, allowDataImage)) {
            return null;
          }

          const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
            src: src,
            alt: attribs.alt ?? '',
            width: attribs.width,
            height: attribs.height,
          };

          return React.createElement('img', imgProps);
        }

        case 'ol': {
          const startStr = attribs.start;
          const start = startStr && !Number.isNaN(Number(startStr)) ? Number(startStr) : undefined;
          const typeStr = attribs.type;
          const type: '1' | 'a' | 'i' | 'A' | 'I' | undefined =
            typeStr && ['1', 'a', 'i', 'A', 'I'].includes(typeStr)
              ? (typeStr as '1' | 'a' | 'i' | 'A' | 'I')
              : undefined;

          const olProps: React.OlHTMLAttributes<HTMLOListElement> = {
            start,
            type,
            className: mergeClass(attribs.class, attribs.className),
          };

          return React.createElement('ol', olProps, children);
        }

        case 'ul':
          return React.createElement(
            'ul',
            {
              className: mergeClass(attribs.class, attribs.className),
            },
            children
          );

        case 'li':
          return React.createElement(
            'li',
            {
              className: mergeClass(attribs.class, attribs.className),
            },
            children
          );

        case 'p':
        case 'h2':
        case 'h3':
        case 'h4': {
          const props: React.HTMLAttributes<HTMLElement> = {
            className: mergeClass(mergeClass(attribs.class, attribs.className), alignClass),
          };
          return React.createElement(tag, props, children);
        }

        default:
          return React.createElement(tag, undefined, children);
      }
    },
  };
}

interface RendererProps {
  content: JSONContent | string | null;
  className?: string;
  allowDataImage?: boolean;
}

function TiptapRenderer({ content, className, allowDataImage = false }: RendererProps) {
  const rawHtml = useMemo(() => {
    if (!content) return '';
    const json: JSONContent =
      typeof content === 'string' ? (JSON.parse(content) as JSONContent) : content;
    return generateHTML(json, extensions);
  }, [content]);

  const cleanHtml = useMemo(
    () =>
      sanitizeHtml(rawHtml, {
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
          ol: ['start', 'type'],
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
        allowedSchemes: allowDataImage
          ? ['http', 'https', 'mailto', 'data']
          : ['http', 'https', 'mailto'],
        disallowedTagsMode: 'discard',
      }),
    [rawHtml, allowDataImage]
  );

  return (
    <div className={['prose prose-stone max-w-none tiptap-renderer', className].join(' ')}>
      {parse(cleanHtml, createParserOptions(allowDataImage))}
    </div>
  );
}
export default TiptapRenderer;
