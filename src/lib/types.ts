export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice';
  fromUserId: string;
  toUserId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export type PeerConnections = {
  [userId: string]: RTCPeerConnection;
};

export type RemoteStreams = {
  [userId: string]: MediaStream;
};
