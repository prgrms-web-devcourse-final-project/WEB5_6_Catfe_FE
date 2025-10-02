import type { JSONContent } from '@tiptap/react';

export function findFirstImage(doc: JSONContent): string | null {
  let url: string | null = null;

  const dfs = (node?: JSONContent): void => {
    if (!node || url) return;

    if (node.type === 'image' && typeof node.attrs?.src === 'string') {
      url = node.attrs.src;
      return;
    }
    node.content?.forEach(dfs);
  };
  dfs(doc);
  return url;
}

export function extractPlainText(doc: JSONContent, limit: number = 120): string {
  let snippet = '';
  const dfs = (node?: JSONContent): void => {
    if (!node || snippet.length >= limit) return;
    if (node.type === 'text' && node.text) {
      snippet += node.text + ' ';
    }
    node.content?.forEach(dfs);
  };

  dfs(doc);
  return snippet.trim().slice(0, limit);
}
