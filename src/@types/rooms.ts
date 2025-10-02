export type RoomMember = {
  userId: number;
  nickname: string;
  role: "HOST" | "MEMBER";
  joinedAt: string;
  lastActiveAt: string;
  online: boolean;
};

export type RoomDetail = {
  roomId: number;
  title: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  status: "WAITING" | "IN_PROGRESS" | "ENDED";
  allowCamera: boolean;
  allowAudio: boolean;
  allowScreenShare: boolean;
  createdBy: string;
  createdAt: string;
  members: RoomMember[];
  private: boolean;
};

export type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
  success: boolean;
};