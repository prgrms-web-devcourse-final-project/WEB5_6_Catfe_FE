import api from "@/utils/api";

export type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
  success: boolean;
};

// 온라인 사용자
export type RoomMemberDTO = {
  userId: number;
  nickname: string;
  role: "HOST" | "SUB_HOST" | "MEMBER" | "VISITOR";
  joinedAt: string | null;
  promotedAt: string | null;
  profileImageUrl?: string | null;
};

// 방 상세
export type RoomDetailDTO = {
  roomId: number;
  title: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  status: "WAITING" | "ACTIVE" | "PAUSED";
  allowCamera: boolean;
  allowAudio: boolean;
  allowScreenShare: boolean;
  createdBy: string;
  createdAt: string;
  private: boolean;
  members?: RoomMemberDTO[];
};

// 방 상세 정보
export async function getRoomDetail(roomId: string | number) {
  const res = await api.get<ApiEnvelope<RoomDetailDTO>>(`/api/rooms/${roomId}`);
  return res.data.data;
}

// 온라인 사용자
export async function getRoomMembers(roomId: string | number) {
  const res = await api.get<ApiEnvelope<RoomMemberDTO[]>>(`/api/rooms/${roomId}/members`);
  return res.data.data;
}