import sanitizeHtml from 'sanitize-html';

export const SANITIZE_OPTIONS = {
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
  disallowedTagsMode: 'discard' as const,
};

export function safeSanitizeHtml(html: string, allowDataImage: boolean = false): string {
  return sanitizeHtml(html, {
    ...SANITIZE_OPTIONS,
    allowedSchemes: allowDataImage
      ? ['http', 'https', 'mailto', 'data']
      : ['http', 'https', 'mailto'],
  });
}
