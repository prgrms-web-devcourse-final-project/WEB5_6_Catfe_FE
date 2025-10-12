export function findFirstImage(htmlContent: string): string | null {
  // let url: string | null = null;

  // const dfs = (node?: JSONContent): void => {
  //   if (!node || url) return;

  //   if (node.type === 'image' && typeof node.attrs?.src === 'string') {
  //     url = node.attrs.src;
  //     return;
  //   }
  //   node.content?.forEach(dfs);
  // };
  // dfs(doc);
  // return url;
  const regex = /<img\s+[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*>/i;
  const match = htmlContent.match(regex);

  return match ? match[1] : null;
}

export function extractPlainText(htmlContent: string, limit: number = 120): string {
  // let snippet = '';
  // const dfs = (node?: JSONContent): void => {
  //   if (!node || snippet.length >= limit) return;
  //   if (node.type === 'text' && node.text) {
  //     snippet += node.text + ' ';
  //   }
  //   node.content?.forEach(dfs);
  // };

  // dfs(doc);
  // return snippet.trim().slice(0, limit);
  // 1. HTML 태그 제거 (간단한 방법: <...> 패턴을 공백으로 대체)
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ');

  // 2. 여러 개의 공백을 하나로 줄이고 앞뒤 공백 제거
  const normalizedText = plainText.replace(/\s+/g, ' ').trim();

  // 3. 길이 제한 적용
  return normalizedText.slice(0, limit);
}
