import { useQuery } from "@tanstack/react-query";
import { getRoomDetail, getRoomMembers, RoomDetailDTO, RoomMemberDTO } from "./apiRoomDetail";


export const roomQk = {
  room: (id: string | number) => ["room", id] as const,
  roomMembers: (id: string | number) => ["room", id, "members"] as const,
};

// 방 상세 쿼리 훅
export function useRoomInfoQuery(roomId: string | number) {
  return useQuery<RoomDetailDTO>({
    queryKey: roomQk.room(roomId),
    queryFn: () => getRoomDetail(roomId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

// 온라인 멤버 쿼리 훅
export function useRoomMembersQuery(roomId: string | number) {
  return useQuery<RoomMemberDTO[]>({
    queryKey: roomQk.roomMembers(roomId),
    queryFn: () => getRoomMembers(roomId),
    staleTime: 5_000,
    refetchOnWindowFocus: false,
  });
}