// rooms/[id]에서 필요한 타입들 입니다. 
// 추후 스터디룸에 대한 타입 합칠 예정

export type Role = "HOST" | "SUB_HOST" | "MEMBER" | "VISITOR";

export type RoomInfo = {
  id: number;
  title: string;
  description: string;
  maxMember: number;
  isPrivate: boolean;
  // password?: string | null;
  coverPreviewUrl: string | null;
  currentParticipants: number;
  status: "ACTIVE" | "INACTIVE";
  allowCamera: true;
  allowAudio: true;
  allowScreenShare: true;
  ownerName?: string;
  createdAt?: string;
};

export type RoomMember = {
  id: number;
  name: string;
  role: Role;
};

export type RoomSnapshot = {
  info: RoomInfo;
  members: RoomMember[];
};

export type VoiceState = {
  muted: boolean;
  by?: "self" | "owner" | "staff";
  speaking?: boolean;
};

export type UsersListItem = RoomMember & {
  avatarUrl?: string | null;
  voice?: VoiceState;
  isMe?: boolean;
  joinedAt?: string | null;
};

export type RoomSnapshotUI = Omit<RoomSnapshot, "members"> & {
  members: UsersListItem[];
};

  // 추후 필요 타입 추가 예정