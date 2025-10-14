// import { generateHTML, type JSONContent } from '@tiptap/react';
import React, { useMemo } from 'react';
import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
  Text,
} from 'html-react-parser';
import { safeSanitizeHtml } from '@/utils/safeSanitizeHtml';

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
  const options: HTMLReactParserOptions = {
    replace: (node) => {
      // text -> text 기본 렌더링
      if ((node as Text).type === 'text') return undefined;

      // element -> element 기본 렌더링
      const el = node as Element;
      if (!el || !el.name) return undefined;

      const tag = el.name.toLowerCase();
      const attribs: Record<string, string> = { ...el.attribs };

      // alignment -> class로 추가
      const alignClass =
        tag === 'p' || tag === 'h2' || tag === 'h3' || tag === 'h4'
          ? formatAlignToClass(attribs.style)
          : undefined;

      const children =
        el.children && el.children.length
          ? domToReact(toDomNodes(el.children), createParserOptions(allowDataImage))
          : null;

      delete attribs.style;
      const baseProps: React.HTMLAttributes<HTMLElement> = {
        className: mergeClass(attribs.class, attribs.className),
      };

      switch (tag) {
        case 'a': {
          const target = attribs.target === '_blank' ? '_blank' : undefined;
          const rel = target ? 'noopener noreferrer' : undefined;
          const aProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
            ...baseProps,
            href: attribs.href,
            target,
            rel,
            title: attribs.title,
          };
          return React.createElement('a', aProps, children);
        }

        case 'img': {
          const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
            src: attribs.src,
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
            ...baseProps,
            start,
            type,
          };

          return React.createElement('ol', olProps, children);
        }

        case 'ul':
        case 'li':
          return React.createElement(tag, baseProps, children);

        case 'p':
        case 'h2':
        case 'h3':
        case 'h4': {
          const headingProps: React.HTMLAttributes<HTMLElement> = {
            className: mergeClass(baseProps.className, alignClass),
          };
          return React.createElement(tag, headingProps, children);
        }

        default:
          return React.createElement(tag, baseProps, children);
      }
    },
  };
  return options;
}

interface RendererProps {
  content: string | null;
  className?: string;
  allowDataImage?: boolean;
}

function TiptapRenderer({ content, className, allowDataImage = false }: RendererProps) {
  const rawHtml = useMemo(() => {
    return content || '';
  }, [content]);

  // HTML Sanitization
  const cleanHtml = useMemo(
    () => safeSanitizeHtml(rawHtml, allowDataImage),
    [rawHtml, allowDataImage]
  );

  // Parser Options 안정화
  const parserOptions = useMemo(() => createParserOptions(allowDataImage), [allowDataImage]);

  return (
    <div className={['prose prose-stone max-w-none tiptap-renderer', className].join(' ')}>
      {parse(cleanHtml, parserOptions)}
    </div>
  );
}
export default TiptapRenderer;
