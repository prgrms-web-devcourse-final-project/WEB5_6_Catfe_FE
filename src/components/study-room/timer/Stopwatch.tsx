"use client";

import { useEffect, useRef, useState } from "react";
import showToast from "@/utils/showToast";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

type PauseRecord = {
  pausedAt: Date;
  resumedAt?: Date;
};

type StudyRecord = {
  subject: string;
  startTime: Date | null;
  endTime: Date | null;
  duration: number; 
  pauses: PauseRecord[];
};

export default function Stopwatch() {
  const [subject, setSubject] = useState("자유 공부");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pauses, setPauses] = useState<PauseRecord[]>([]);
  const [records, setRecords] = useState<StudyRecord[]>([]); 
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

  // 시작
  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date());
    setElapsed(0);
    setPauses([]);
  };

  // 일시정지
  const handlePause = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setPauses((prev) => [...prev, { pausedAt: new Date() }]);
  };

  // 이어하기 (Resume → Continue)
  const handleContinue = () => {
    setIsRunning(true);
    setPauses((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last && !last.resumedAt) {
        last.resumedAt = new Date();
      }
      return copy;
    });
  };

  // 종료
  const handleEnd = async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const finishedAt = new Date();

    const newRecord: StudyRecord = {
      subject,
      startTime,
      endTime: finishedAt,
      duration: elapsed,
      pauses,
    };

    setRecords((prev) => [...prev, newRecord]);
    // 리셋
    setStartTime(null);
    setElapsed(0);
    setPauses([]);
    showToast("success", "기록되었습니다.");
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 과목 선택 */}
      <label className="sr-only" htmlFor="subject">과목 선택</label>
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="px-4 py-2 border rounded-lg"
        disabled={!!startTime} 
        aria-label="과목 선택"
      >
        <option value="자유 공부">자유 공부</option>
        <option value="Next.js 공부하기">Next.js 공부하기</option>
        <option value="TailwindCSS 공부하기">TailwindCSS 공부하기</option>
      </select>

      {/* 시간 표시 */}
      <div className="font-mono text-5xl">{formatTime(elapsed)}</div>

      <div className="flex gap-4">
        {!startTime ? (
          // 시작 전
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-yellow-400 text-white rounded-lg shadow"
          >
            Start
          </button>
        ) : isRunning ? (
          // 실행 중
          <>
            <button
              onClick={handlePause}
              className="px-6 py-2 bg-yellow-400 text-white rounded-lg shadow"
            >
              Pause
            </button>
            <button
              onClick={handleEnd}
              className="px-6 py-2 bg-red-500 text-white rounded-lg shadow"
            >
              End
            </button>
          </>
        ) : (
          // 일시정지 상태
          <>
            <button
              onClick={handleContinue} 
              className="px-6 py-2 bg-yellow-400 text-white rounded-lg shadow"
            >
              Continue
            </button>
            <button
              onClick={handleEnd}
              className="px-6 py-2 bg-red-500 text-white rounded-lg shadow"
            >
              End
            </button>
          </>
        )}
      </div>

      {/* 데이터 확인. 나중에 무적권 지울것*/}
      <div className="mt-6 w-full max-w-md">
        <h3 className="font-bold mb-2">가상 테이블</h3>
        <ul className="space-y-2">
          {records.map((r, i) => (
            <li key={i} className="p-2 border rounded-lg text-sm">
              <p>{r.subject}</p>
              <p>
                시작: {r.startTime?.toLocaleTimeString()} / 끝:{" "}
                {r.endTime?.toLocaleTimeString()}
              </p>
              {r.pauses.map((p, idx) => (
                <p key={idx}>
                  정지: {p.pausedAt.toLocaleTimeString()} / 재시작:{" "}
                  {p.resumedAt ? p.resumedAt.toLocaleTimeString() : "-"}
                </p>
              ))}
              <p>총 시간: {formatTime(r.duration)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
