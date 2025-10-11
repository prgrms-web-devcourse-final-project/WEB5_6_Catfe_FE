"use client";

import { useEffect, useRef } from "react";
import SignalingClient from "@/lib/signalingClient";
import type { WebRTCSignal } from "@/lib/types";

/** STOMP signaling 싱글톤 훅 */
export function useSignaling(params: {
  roomId: string;
  userId: string;
  onSignal: (s: WebRTCSignal) => void;
}) {
  const { roomId, userId, onSignal } = params;
  const clientRef = useRef<SignalingClient | null>(null);

  useEffect(() => {
    if (clientRef.current) return;
    const c = new SignalingClient(roomId, userId, onSignal);
    clientRef.current = c;

    return () => {
      clientRef.current?.disconnect();
      clientRef.current = null;
    };
  }, [roomId, userId, onSignal]);

  return clientRef;
}
