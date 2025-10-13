import { ApiResponse } from './type';

/* --------- WebSocket Health Check (GET /api/ws/health) ---------- */
export type WebSocketEndpoints = {
  websocket: string; // "/ws"
  heartbeat: string; // "/app/heartbeat"
  activity: string; // "/app/activity"
};
export type WebSocketHealthData = {
  service: 'WebSocket';
  status: 'running' | 'error' | 'maintenance';
  timestamp: string; // "2025-09-25T10:30:00"
  sessionTTL: string;
  heartbeatInterval: string; // "5분"
  totalOnlineUsers: number;
  endpoints: WebSocketEndpoints;
};
export type WebSocketHealthResponse = ApiResponse<WebSocketHealthData | null>;

/* --------- WebSocket Info (GET /api/ws/info) ---------- */
export type WebSocketInfoTopics = {
  roomChat: string; // "/topic/rooms/{roomId}/chat"
  privateMessage: string; // "/user/queue/messages"
  notifications: string; // "/user/queue/notifications"
};

export type WebSocketInfoDestinations = {
  heartbeat: string; // "/app/heartbeat"
  activity: string; // "/app/activity"
  roomChat: string; // "/app/rooms/{roomId}/chat"
};

export type WebSocketInfoData = {
  websocketUrl: string; // "/ws"
  sockjsSupport: boolean;
  stompVersion: string; // "1.2"
  heartbeatInterval: string; // "5분"
  sessionTTL: string; // "10분"
  description: string;
  subscribeTopics: WebSocketInfoTopics;
  sendDestinations: WebSocketInfoDestinations;
};

export type WebSocketInfoResponse = ApiResponse<WebSocketInfoData | null>;

/* --------- WebSocket ErrorCodes ---------- */
export type WebSocketErrorCode = 'WS_REDIS_ERROR' | 'WS_CONNECTION_FAILED';
export type WebSocketErrorResponse = ApiResponse<null> & { code: WebSocketErrorCode };

/* --------- Stomp Message ---------- */
export interface HeartbeatMessage {
  userId: number;
}
export interface ChatSendMessage {
  content: string;
}

/* --------- WebSocket 수신 메시지 (서버 → 클라) ---------- */
export interface ApiChatMsg {
  messageId: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  content: string;
  createdAt: string;
}

/* --------- 클라이언트 UI 상태/컴포넌트 타입 ---------- */
export interface ChatMsg {
  id: number;
  from: 'ME' | 'OTHER';
  content: string;
  createdAt: number;
}
