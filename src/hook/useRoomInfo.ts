"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import api from "@/utils/api";

export type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
  success: boolean;
};

export type RoomMemberDTO = {
  userId: number;
  nickname: string;
  role: "HOST" | "SUB_HOST" | "MEMBER" | "VISITOR";
  joinedAt: string | null;
  promotedAt: string | null;
  profileImageUrl?: string | null;
};

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
  members: RoomMemberDTO[];
};

export const roomInfoQk = {
  detail: (id: string | number) => ["roomInfo", id] as const,
};

async function getRoomDetail(roomId: string | number) {
  const res = await api.get<ApiEnvelope<RoomDetailDTO>>(`/api/rooms/${roomId}`);
  return res.data.data;
}

type RoomInfoKey = ReturnType<typeof roomInfoQk.detail>;
type RoomInfoOptions = UseQueryOptions<RoomDetailDTO, Error, RoomDetailDTO, RoomInfoKey>;

export function useRoomInfoQuery(
  roomId: string | number,
  options?: Omit<RoomInfoOptions, "queryKey" | "queryFn">
) {
  return useQuery<RoomDetailDTO, Error, RoomDetailDTO, RoomInfoKey>({
    queryKey: roomInfoQk.detail(roomId),
    queryFn: () => getRoomDetail(roomId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}