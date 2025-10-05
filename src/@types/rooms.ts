export type CreateRoomDto = {
  title: string;
  description: string;
  isPrivate: boolean;
  password?: string;
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
    status: string;
    createdBy: string;
    createdAt: string;
    allowCamera:boolean;
    allowAudio: boolean;
    allowScreenShare: boolean;
  };
  success: boolean;
};

export type MyRoomsList = {
  roomId : number;
  title: string;
  description: string;
  currentParticipants: number;
  maxParticipants: number;
  status: string;
  myRole: "HOST" | "SUB_HOST" | "MEMBER";
  createdAt: string;
}