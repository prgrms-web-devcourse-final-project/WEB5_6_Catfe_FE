"use client";

import { useEffect, useState, useRef } from "react";
import { useTimer } from "./useTimer";
import Image from "next/image";

export default function Timer() {
  const { timeLeft, isRunning, start, pause, reset, setTimeLeft } = useTimer();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const alarmRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return { h, m, s };
  };

  const handleChange = (type: "h" | "m" | "s", value: number) => {
    let h = hours;
    let m = minutes;
    let s = seconds;

    if (type === "h") h = value;
    if (type === "m") m = value;
    if (type === "s") s = value;

    setHours(h);
    setMinutes(m);
    setSeconds(s);

    const total = h * 3600 + m * 60 + s;
    setTimeLeft(total);
  };

  const handleReset = () => {
    reset();
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
  };

  const handleStop = () => {
    pause();
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
    const total = hours * 3600 + minutes * 60 + seconds;
    setTimeLeft(total);
  };

  const { h, m, s } = formatTime(timeLeft);

  // 알람 대폭발 같은거 넣고싶다....
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      alarmRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
      alarmRef.current.play().catch((err) => console.error("알람 실행 실패:", err));
    }
  }, [timeLeft, isRunning]);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col items-center gap-6"
    >
      <div className="flex items-center gap-2 font-mono text-4xl">
        <input
          type="number"
          value={isRunning ? h : hours === 0 ? "" : String(hours).padStart(2, "0")}
          onChange={(e) => handleChange("h", Number(e.target.value))}
          disabled={isRunning}
          placeholder="00"
          min={0}
          required
          className="w-16 text-center outline-none border-none bg-transparent"
        />
        :
        <input
          type="number"
          value={isRunning ? m : minutes === 0 ? "" : String(minutes).padStart(2, "0")}
          onChange={(e) => handleChange("m", Number(e.target.value))}
          disabled={isRunning}
          placeholder="00"
          min={0}
          max={59}
          required
          className="w-16 text-center outline-none border-none bg-transparent"
        />
        :
        <input
          type="number"
          value={isRunning ? s : seconds === 0 ? "" : String(seconds).padStart(2, "0")}
          onChange={(e) => handleChange("s", Number(e.target.value))}
          disabled={isRunning}
          placeholder="00"
          min={0}
          max={59}
          required
          className="w-16 text-center outline-none border-none bg-transparent"
        />
      </div>
      <div className="flex gap-4 items-center">
        {!isRunning ? (
          <button
            type="button"
            onClick={start}
            disabled={timeLeft === 0}
            className={`px-6 py-2 rounded-lg shadow ${
              timeLeft === 0 ? "bg-secondary-300 cursor-not-allowed" : "bg-yellow-400 text-white"
            }`}
          >
            Start
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="px-6 py-2 bg-red-500 text-white rounded-lg shadow"
          >
            Stop
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="w-8 h-8 flex items-center justify-center"
          aria-label="타이머 초기화"
        >
          <Image src="/icon/reset.svg" alt="reset" width={24} height={24} />
        </button>
      </div>
    </form>
  );
}
