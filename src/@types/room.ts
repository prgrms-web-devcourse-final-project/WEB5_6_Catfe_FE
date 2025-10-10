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
};

export type VoiceState = {
  muted: boolean;
  by?: "self" | "owner" | "staff";
  speaking?: boolean;
};

export type Presence = "online" | "idle" | "offline";

export type RoomType = "media" | "chat";

export type MediaState = {
  camOn: boolean;   
  screenOn: boolean; 
};

export type UsersListItem = RoomMember & {
  avatarUrl?: string | null;
  voice?: VoiceState;
  presence?: Presence;
  isMe?: boolean;
  media?: MediaState; 
};

export type RoomSnapshotUI = Omit<RoomSnapshot, "members"> & {
  members: UsersListItem[];
};


export type StreamsByUser = Record<string, MediaStream | null>;
