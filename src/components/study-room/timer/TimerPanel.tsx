"use client";

import { useState } from "react";
import Timer from "./Timer";
import Stopwatch from "./Stopwatch";

export default function TimerPanel() {
  const [activeTab, setActiveTab] = useState<"timer" | "record">("timer");

  return (
    <div className="w-[280px] sm:w-[360px] rounded-xl border border-secondary-600 p-6 bg-white shadow">
      <div className="relative w-[240px] sm:w-[313px] h-[48px] mx-auto bg-gray-100 rounded-full flex">
        <div
          className={`absolute top-0 left-0 h-[48px] w-1/2 rounded-full bg-yellow-300 transition-transform duration-300 ease-in-out ${
            activeTab === "record" ? "translate-x-full" : ""
          }`}
        />
        <div className="flex w-full relative z-10 text-center font-bold text-[16px] text-sm sm:text-base">
          <button
            onClick={() => setActiveTab("timer")}
            className={`flex-1 ${
              activeTab === "timer" ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            타이머
          </button>
          <button
            onClick={() => setActiveTab("record")}
            className={`flex-1 ${
              activeTab === "record" ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            공부시간 기록
          </button>
        </div>
      </div>
      <div className="flex min-h-[140] items-center justify-center mt-6">
        <div className={activeTab === "timer" ? "block" : "hidden"}>
           <Timer />
        </div>
        <div className={activeTab === "record" ? "block" : "hidden"}>
           <Stopwatch />
        </div>
      </div>
    </div>
  );
}
