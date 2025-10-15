"use client";

import { useEffect, useRef } from "react";
import SignalingClient from "@/lib/signalingClient";
import type { WebRTCSignal } from "@/lib/types";

export function useSignaling(params: {
  roomId: string;
  userId: string;
  onSignal: (s: WebRTCSignal) => void;
}) {
  const { roomId, userId, onSignal } = params;
  const clientRef = useRef<SignalingClient | null>(null);

  useEffect(() => {
    if (clientRef.current) return;
    const client = new SignalingClient(roomId, userId, () => {
      console.log("[signaling] connected");
    });

    client.addSignalListener(onSignal);
    clientRef.current = client;
    return () => {
      client.removeSignalListener(onSignal);
      clientRef.current?.disconnect();
      clientRef.current = null;
    };
  }, [roomId, userId, onSignal]);

  return clientRef;
}
