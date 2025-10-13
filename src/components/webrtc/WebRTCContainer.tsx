"use client";

import { useCallback } from "react";
import { useLocalStream } from "@/hook/useLocalStream";
import { useSignaling } from "@/hook/useSignaling";
import type { WebRTCSignal } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";

export default function WebRTCContainer() {
  const roomId = "room-002";
  const userId = "frontend-user";

  const localStream = useLocalStream();

  const onSignal = useCallback((signal: WebRTCSignal) => {
    console.log("[signaling] <-", signal);
  }, []);

  useSignaling({ roomId, userId, onSignal });

  return (
    <div className="p-4">
      <div className="rounded-xl border w-[720px] h-[405px] overflow-hidden">
        <VideoPlayer stream={localStream} />
      </div>
      <p className="text-center text-sm text-[var(--color-text-secondary)] mt-2">
        frontend-user (me)
      </p>
      <div className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        참가자 입장을 기다리고 있어요…
      </div>
    </div>
  );
}
