'use client';

import Button from '@/components/Button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function NotFound() {
  const router = useRouter();

  const handleClick = () => {
    if (document.referrer && document.referrer.startsWith(window.location.origin)) {
      // 사이트 안에서 이동한 경우 뒤로가기
      router.back();
    } else {
      // 직접 진입 or 외부 링크 진입 -> home으로
      router.push('/');
    }
  };

  return (
    <main className="h-dvh flex flex-col gap-6 items-center justify-center w-dvw max-w-[1200px] mx-auto">
      <div className="flex items-center text-center gap-3 w-3/4 h-50">
        <span className="inline-flex justify-center items-center w-1/3 h-full text-9xl">4</span>
        <div className="w-1/3 h-2/3 relative">
          <Image src="/image/cat-default.svg" alt="" fill />
        </div>
        <span className="inline-flex justify-center items-center w-1/3 h-full text-9xl">4</span>
      </div>
      <div className="flex flex-col w-3/4 items-center justify-center gap-5">
        <hr className="w-full" />
        <p className="text-center font-light text-text-secondary text-sm">
          페이지를 찾을 수 없습니다.
          <br /> 존재하지 않는 주소를 입력하셨거나,
          <br /> 요청하신 페이지의 주소가 변경, 삭제되었습니다.
        </p>
        <Button borderType="solid" color="secondary" className="mx-auto" onClick={handleClick}>
          돌아가기
        </Button>
      </div>
    </main>
  );
}
export default NotFound;
