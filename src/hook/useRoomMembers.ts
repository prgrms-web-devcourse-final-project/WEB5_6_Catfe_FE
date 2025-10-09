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

export const roomMembersQk = {
  list: (id: string | number) => ["roomMembers", id] as const,
};

async function getRoomMembers(roomId: string | number) {
  const res = await api.get<ApiEnvelope<RoomMemberDTO[]>>(
    `/api/rooms/${roomId}/members`
  );
  return res.data.data;
}

type RoomMembersKey = ReturnType<typeof roomMembersQk.list>;
type RoomMembersOptions = UseQueryOptions<RoomMemberDTO[], Error, RoomMemberDTO[], RoomMembersKey>;

export function useRoomMembersQuery(
  roomId: string | number,
  options?: Omit<RoomMembersOptions, "queryKey" | "queryFn">
) {
  return useQuery<RoomMemberDTO[], Error, RoomMemberDTO[], RoomMembersKey>({
    queryKey: roomMembersQk.list(roomId),
    queryFn: () => getRoomMembers(roomId),
    staleTime: 5_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}
