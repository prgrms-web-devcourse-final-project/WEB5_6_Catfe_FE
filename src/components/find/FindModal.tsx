"use client";

import { useState } from "react";
import FindIdForm from "./FindIdForm";
import FindPasswordForm from "./FindPasswordForm";
import Image from "next/image";

export default function FindModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"id" | "password">("id");

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={handleOverlayClick}>
      <div className="bg-background-base w-[580px] h-[550px] sm:rounded-lg relative p-6 sm:p-10 flex flex-col max-w-[90%] max-h-[90%] border border-yellow-400">
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          aria-label="닫기"
        >
          <Image src="/icon/xbtn.svg" alt="닫기" width={15} height={15} />
        </button>
        <div className="flex gap-12 justify-center mt-10">
          <button
            onClick={() => setMode("id")}
            className="flex items-center gap-2"
          >
            <span
              className={`w-5 h-5 rounded-full border-2 ${
                mode === "id"
                  ? "bg-primary-600 border-primary-600"
                  : "border-gray-400"
              }`}
            />
            <span
              className={`text-lg ${
                mode === "id" ? "font-semibold text-primary-700" : "text-gray-500"
              }`}
            >
              아이디 찾기
            </span>
          </button>
          <button
            onClick={() => setMode("password")}
            className="flex items-center gap-2"
          >
            <span
              className={`w-5 h-5 rounded-full border-2 ${
                mode === "password"
                  ? "bg-primary-600 border-primary-600"
                  : "border-gray-400"
              }`}
            />
            <span
              className={`text-lg ${
                mode === "password"
                  ? "font-semibold text-primary-700"
                  : "text-gray-500"
              }`}
            >
              비밀번호 찾기
            </span>
          </button>
        </div>
        <hr className="w-full max-w-[500px] mx-auto border-t border-black mt-12 mb-10" />
        <div className="flex items-center justify-center">
          {mode === "id" ? (
            <FindIdForm onSuccess={onClose} />
          ) : (
            <FindPasswordForm onSuccess={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
