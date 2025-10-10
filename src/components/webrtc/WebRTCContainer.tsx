"use client";

import { useCallback } from "react";
import { useLocalStream } from "@/hook/useLocalStream";
import { useSignaling } from "@/hook/useSignaling";
import type { WebRTCSignal } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";

export default function WebRTCContainer() {
  // 테스트용 고정 식별자 (페이지 param과 연동해도 OK)
  const roomId = "room-002";
  const userId = "frontend-user";
  const accessToken = "dummyToken";

  // 1) 로컬 스트림: 정확히 한 번만 획득
  const localStream = useLocalStream();

  // 2) 시그널링: 싱글톤으로 연결
  const onSignal = useCallback((signal: WebRTCSignal) => {
    // 1차 목표는 연결 확인이므로 로그만
    console.log("[signaling] <-", signal);
  }, []);
  const signalingRef = useSignaling({ roomId, userId, accessToken, onSignal });

  // (옵션) 테스트 송신
  // const sendTest = useCallback(() => {
  //   signalingRef.current?.sendSignal({
  //     type: "offer",
  //     fromUserId: userId,
  //     toUserId: "someone",
  //     sdp: { type: "offer", sdp: "test-sdp" } as any,
  //   });
  // }, [signalingRef, userId]);

  return (
    <div className="p-4">
      <div className="rounded-xl border w-[720px] h-[405px] overflow-hidden">
        <VideoPlayer stream={localStream} />
      </div>
      <p className="text-center text-sm text-gray-500 mt-2">frontend-user (me)</p>

      {/* <div className="mt-4">
        <button className="px-3 py-1 border rounded" onClick={sendTest}>Send test</button>
      </div> */}

      <div className="mt-6 text-center text-sm text-gray-500">
        참가자 입장을 기다리고 있어요…
      </div>
    </div>
  );
}
