import readMyUserId from "@/utils/readMyUserId";
import { useQueryClient } from "@tanstack/react-query";
import { RoomMemberDTO, roomMembersQk } from "./useRoomMembers";

/** 캐시가 없으면 me를 계산하지 않고, hasCache로만 노출 */
export function useMyRoomMemberFromCache(roomId: string | number) {
  const qc = useQueryClient();
  const myId = readMyUserId();

  // 캐시 상태 확인
  const state = qc.getQueryState(roomMembersQk.list(roomId));
  const hasCache = !!state?.dataUpdatedAt; // 캐시가 있으면 timestamp 존재

  const members = hasCache
    ? qc.getQueryData<RoomMemberDTO[]>(roomMembersQk.list(roomId))
    : undefined;

  const me = members?.find((m) => m.userId === myId) ?? null;

  return { me, hasCache };
}