"use client";

function HoverInfoBox() {
  const BOX_BASE =
    "aspect-[16/10] w-full rounded-xl grid place-items-center relative overflow-hidden group";
   const OVERLAY_BASE =
    "absolute inset-0 transition-all duration-500 bg-transparent group-hover:bg-white/60 group-hover:backdrop-blur-sm";
  const TEXT_BASE =
    "flex flex-col gap-5 text-xl font-bold text-center opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0";

  return (
    <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-15 justify-items-center">
      {/* 1 */}
      <div
        className={`${BOX_BASE} bg-[url('/image/home-descript-1.png')] bg-[length:100%_100%] bg-no-repeat`}
      >
        <div className={OVERLAY_BASE}></div>
        <div className={TEXT_BASE}>
          <span>고양이와 함께하는 온라인 스터디 카페 ☕</span>
          <span>당신의 공부 시간에 아늑함을 더해➕드립니다.</span>
        </div>
      </div>

      {/* 2 */}
      <div className={`${BOX_BASE} bg-secondary-200`}>
        <div className={OVERLAY_BASE}></div>
        <div className={TEXT_BASE}>
          <span>혼자👤보다 함께👥 집중할 수 있는 공간</span>
          <span>방을 만들고, 초대하고, 서로의 목표를 응원하세요.</span>
        </div>
      </div>

      {/* 3 */}
      <div className={`${BOX_BASE} bg-[url('/image/planner-capture.jpg')] bg-[length:100%_] bg-no-repeat`}>
        <div className={OVERLAY_BASE}></div>
        <div className={TEXT_BASE}>
          <span>오늘의 계획, 공부 기록, 주간 플랜까지!</span>
          <span>플래너를 작성✍🏻하고, 진행도를 확인👀하세요.</span>
        </div>
      </div>

      {/* 4 */}
      <div className={`${BOX_BASE} bg-secondary-200/20 bg-[url('/image/cat-monitor.svg')] bg-[length:100%_100%] bg-no-repeat`}>
        <div className={OVERLAY_BASE}></div>
        <div className={TEXT_BASE}>
          <span>온라인에서도 함께 있는 듯한 몰입감✨</span>
          <span>친구들과 실시간으로 대화🗣️하며 공부하세요.</span>
        </div>
      </div>
    </section>
  );
}

export default HoverInfoBox;