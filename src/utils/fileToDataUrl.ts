export default function fileToDataUrl(file: File) {
  return new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onerror = () => rej('파일을 읽는 데 실패했습니다.');
    r.onload = () => res(String(r.result));
    r.readAsDataURL(file);
  });
}
