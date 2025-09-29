export type Role = "owner" | "staff" | "member";

export type RoomInfo = {
  id: string;
  title: string;
  description: string;
  maxMember: number;
  isPrivate: boolean;
  password?: string | null;
  coverPreviewUrl: string | null;
  mediaEnabled: boolean;
};

export type RoomMember = {
  id: string;
  name: string;
  role: Role;
  email: string;
};

export type RoomSnapshot = {
  info: RoomInfo;
  members: RoomMember[];
  // 추후 필요 타입 추가 예정
};

export type VoiceState = {
  muted: boolean;
  by?: "self" | "owner" | "staff";
  speaking?: boolean;
};

export type Presence = "online" | "idle" | "offline";

export type UsersListItem = RoomMember & {
  avatarUrl?: string | null;
  voice?: VoiceState;
  isMe?: boolean;
};
