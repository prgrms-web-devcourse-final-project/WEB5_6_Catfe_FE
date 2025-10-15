"use client";

import { useEffect, useRef, useState } from "react";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Stopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1000);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStart = () => {
    setElapsed(0);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleContinue = () => {
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsed(0);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="font-mono text-5xl">{formatTime(elapsed)}</div>

      <div className="flex gap-4">
        {!isRunning && elapsed === 0 && (
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-yellow-400 text-white rounded-lg shadow"
          >
            Start
          </button>
        )}

        {isRunning && (
          <button
            onClick={handlePause}
            className="px-6 py-2 bg-yellow-400 text-white rounded-lg shadow"
          >
            Pause
          </button>
        )}

        {!isRunning && elapsed > 0 && (
          <>
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-yellow-400 text-white rounded-lg shadow"
            >
              Continue
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-500 text-white rounded-lg shadow"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
