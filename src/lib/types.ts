export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice';
  fromUserId: string;
  toUserId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export type PeerConnections = { [userId: string]: RTCPeerConnection };
export type RemoteStreams = { [userId: string]: MediaStream };

export type ServerSignalType = 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE' | 'ERROR';

export type ServerSignal = {
  type: ServerSignalType;
  roomId?: number | string;
  fromUserId?: number | string;
  targetUserId?: number | string;
  sdp?: RTCSessionDescriptionInit | null;
  mediaType?: 'VIDEO' | 'AUDIO' | 'SCREEN' | null;
  candidate?: string | { candidate: string };
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  timestamp?: string;
  error?: { code: string; message: string };
};
