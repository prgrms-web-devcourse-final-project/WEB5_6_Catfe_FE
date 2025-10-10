// src/hook/useSignaling.ts
"use client";

import { useEffect, useRef } from "react";
import SignalingClient from "@/lib/signalingClient";
import type { WebRTCSignal } from "@/lib/types";

export function useSignaling(params: {
  roomId: string;
  userId: string;
  accessToken: string;
  onSignal: (s: WebRTCSignal) => void;
}) {
  const { roomId, userId, accessToken, onSignal } = params;
  const clientRef = useRef<SignalingClient | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const c = new SignalingClient(roomId, userId, accessToken, onSignal);
    clientRef.current = c;

    return () => {
      clientRef.current?.disconnect(); // ✅ public 메서드 사용
      clientRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return clientRef;
}
