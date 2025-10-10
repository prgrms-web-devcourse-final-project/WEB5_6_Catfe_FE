// src/lib/types.ts
export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice';
  fromUserId: string;
  toUserId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export type PeerConnections = { [userId: string]: RTCPeerConnection };
export type RemoteStreams   = { [userId: string]: MediaStream };

/**
 * 서버 브로드캐스트 스키마 (명세서 그대로, 대문자 타입)
 * Topic: /topic/room/{roomId}/webrtc
 */
export type ServerSignalType = 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE' | 'ERROR';

export type ServerSignal = {
  type: ServerSignalType;
  roomId: number | string;
  fromUserId: number | string;
  targetUserId?: number | string | null;
  sdp?: RTCSessionDescriptionInit | null;
  candidate?: RTCIceCandidateInit | null;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  mediaType?: 'VIDEO' | 'AUDIO' | 'SCREEN' | null;
  timestamp?: string;
  error?: { code: string; message: string };
};
