export type Role = 'HOST' | 'SUB_HOST' | 'MEMBER' | 'VISITOR';

export type RoomInfo = {
  id: number;
  title: string;
  description: string;
  maxParticipants: number;
  isPrivate: boolean;
  coverPreviewUrl: string | null;
  currentParticipants?: number;
  status: 'WAITING' | 'ACTIVE' | 'PAUSED';
  allowCamera: boolean;
  allowAudio: boolean;
  allowScreenShare: boolean;
  ownerName?: string;
  createdAt?: string;
  mediaEnabled?: boolean;
};

export type RoomMember = {
  id: number;
  name: string;
  role: Role;
  email?: string;
};

export type RoomSnapshot = {
  info: RoomInfo;
  members: RoomMember[];
};

export type VoiceState = {
  muted: boolean;
  by?: 'self' | 'owner' | 'staff';
  speaking?: boolean;
};

export type Presence = 'online' | 'idle' | 'offline';

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
  joinedAt?: string | null;
};

export type RoomSnapshotUI = Omit<RoomSnapshot, 'members'> & {
  members: UsersListItem[];
};

export type StreamsByUser = Record<string, MediaStream | null>;

export type CreateRoomDto = {
  title: string;
  description: string;
  isPrivate: boolean;
  password?: string | null;
  maxParticipants: number;
  useWebRTC: boolean;
};

export type CreateRoomRes = {
  code: string;
  message: string;
  data: {
    roomId: number;
    title: string;
    description: string;
    currentParticipants: number;
    maxParticipants: number;
    status: 'WAITING' | 'ACTIVE' | 'CLOSED';
    createdBy: string;
    createdAt: string;
    allowCamera: boolean;
    allowAudio: boolean;
    allowScreenShare: boolean;
  };
  success: boolean;
};

export type MyRoomsList = {
  roomId: number;
  title: string;
  description: string;
  isPrivate: boolean;
  currentParticipants: number;
  maxParticipants: number;
  status: string;
  myRole: 'HOST' | 'SUB_HOST' | 'MEMBER';
  createdAt: string;
};

export type AllRoomsList = {
  roomId: number;
  title: string;
  description: string;
  isPrivate: boolean;
  currentParticipants: number;
  maxParticipants: number;
  status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'TERMINATED' | string;
  createdBy: string;
  createdAt: string;
  allowCamera: boolean;
  allowAudio: boolean;
  allowScreenShare: boolean;
};

export type ApiRoomMemberDto = {
  userId: number | string;
  nickname: string;
  role?: Role;                   
  profileImageUrl?: string | null;
  email?: string | null;
};