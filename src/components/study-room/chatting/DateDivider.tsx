function DateDivider({ dateString }: { dateString: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-grow border-t border-zinc-300"></div>
      <span className="mx-4 text-xs text-zinc-500 font-medium whitespace-nowrap">{dateString}</span>
      <div className="flex-grow border-t border-zinc-300"></div>
    </div>
  );
}
export default DateDivider;
