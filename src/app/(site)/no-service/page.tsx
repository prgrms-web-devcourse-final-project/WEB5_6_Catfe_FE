import Image from 'next/image';

function NoService() {
  return (
    <div
      className="relative w-screen min-h-screen overflow-hidden flex flex-col items-center justify-between pt-[10dvh]"
      style={{ background: 'linear-gradient(to bottom, #FBFAF6 0%, #FBFAF6 40%, #A3DCFF 100%)' }}
    >
      <div className="flex flex-col items-center p-10 bg-white shadow-xl rounded-lg text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          ⚠️ 지금은 Catfe에 접속하실 수 없습니다. ⚠️
        </h2>
        <p className="text-lg text-gray-700">
          현재 서버 운영 시간이 아니거나(09:00~18:00), 서버에 문제가 발생했을 수 있습니다.
        </p>
        <p className="text-lg text-gray-700 mt-2">잠시 후 다시 시도해 주세요.</p>
      </div>

      <div className="w-full h-full flex flex-col items-center relative">
        <div className="relative h-[500px] w-[500px]">
          <div className="absolute w-[50px] h-[60px] z-20 bottom-[50px] right-0">
            <Image src="/image/bubble.svg" alt="" fill />
          </div>
          <div className="absolute w-[90px] h-[100px] z-10 bottom-0 right-[50px]">
            <Image src="/image/cat-owner.svg" alt="고양이 사장님" fill />
          </div>
          <Image src="/image/catfe-bg.svg" alt="Catfe" fill />
        </div>
        <div className="h-[40px] bg-[#4F3020] w-full" />
        <div className="h-[40px] bg-[#A66C48] w-full" />
        <div className="h-[100px] bg-[#BE824F] w-full" />
      </div>
    </div>
  );
}
export default NoService;
