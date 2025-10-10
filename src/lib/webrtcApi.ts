// src/lib/webrtcApi.ts
import api from '@/utils/api';

type ApiResp<T> = {
  code: string;
  message: string;
  data: T;
  success: boolean;
};

/** 명세 ICE 서버 엔트리 */
export type IceServer = {
  urls: string | string[];
  username?: string | null;
  credential?: string | null;
};

type IceServersPayload = { iceServers: IceServer[] };

export type WsHealth = {
  service: 'WebSocket' | string;
  status: 'running' | 'down' | string;
  timestamp: string;
  sessionTTL: string;
  heartbeatInterval: string;
  totalOnlineUsers: number;
  endpoints: {
    websocket: string;
    heartbeat: string;
    activity: string;
  };
};

export type WsInfo = {
  websocketUrl: string;
  sockjsSupport: boolean;
  stompVersion: string;
  heartbeatInterval: string;
  sessionTTL: string;
  description?: string;
  subscribeTopics?: {
    roomChat?: string;
    privateMessage?: string;
    notifications?: string;
  };
  sendDestinations?: {
    heartbeat?: string;
    activity?: string;
    roomChat?: string;
  };
};

/** IceServer[] -> RTCIceServer[] 매핑 */
function toRtcIceServers(servers: IceServer[]): RTCIceServer[] {
  return servers.map((s) => ({
    urls: s.urls,
    username: s.username ?? undefined,
    credential: s.credential ?? undefined,
  }));
}

export async function getIceServers(params?: { userId?: number; roomId?: number }) {
  const { data } = await api.get<ApiResp<IceServersPayload>>('/api/webrtc/ice-servers', {
    params,
  });
  return data.data.iceServers;
}

export async function makeRtcConfig(params?: { userId?: number; roomId?: number }) {
  const iceServers = await getIceServers(params);
  const rtcConfig: RTCConfiguration = { iceServers: toRtcIceServers(iceServers) };
  return rtcConfig;
}

export async function getSignalingHealth() {
  const { data } = await api.get<ApiResp<null>>('/api/webrtc/health');
  return data.success;
}

export async function getWsHealth() {
  const { data } = await api.get<ApiResp<WsHealth>>('/api/ws/health');
  return data.data;
}

export async function getWsInfo() {
  const { data } = await api.get<ApiResp<WsInfo>>('/api/ws/info');
  return data.data;
}
