function UnreadDivider() {
  return (
    <div className="relative my-8 text-center">
      <hr className="border-zinc-300" />
      <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-zinc-50 px-2 text-xs text-zinc-500 whitespace-nowrap block rounded-full">
        여기까지 읽으셨습니다.
      </span>
    </div>
  );
}
export default UnreadDivider;
