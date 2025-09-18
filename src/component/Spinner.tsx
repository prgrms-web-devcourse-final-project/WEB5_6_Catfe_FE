import tw from '@/utils/tw';

interface SpinnerProps {
  width?: string; // "50px" | "2rem" 등
  height?: string;
  className?: string;
}

function Spinner({ width = '300px', height = '100px', className }: SpinnerProps) {
  return (
    <div className={tw('size-full flex justify-center items-center', className)}>
      <div className={'animation-spinner'} style={{ width, height }}></div>
    </div>
  );
}
export default Spinner;
