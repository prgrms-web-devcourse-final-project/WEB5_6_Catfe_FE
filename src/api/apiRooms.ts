import api from "@/utils/api";
import type { CreateRoomDto, CreateRoomRes, MyRoomsList } from "@/@types/rooms";

/** 공통 페이지 응답 타입 (Spring Data JPA 호환) */
export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  number: number;        // 0-based index
  totalElements?: number;
  size?: number;
};

function safeErrorMessage(err: unknown, fallback = "요청 처리 중 오류가 발생했어요.") {
  const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
  return anyErr?.response?.data?.message ?? anyErr?.message ?? fallback;
}

/** 내 캣페 목록 조회 (page: 0-based, size: 페이지당 개수) */
export async function getMyRooms(page: number, size: number) {
  try {
    const res = await api.get<PageResponse<MyRoomsList>>("/api/rooms/my", {
      params: { page, size },
    });
    return res.data;
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "내 캣페 목록을 불러오지 못했어요."));
  }
}

/** 스터디룸 생성 */
export async function createRoom(dto: CreateRoomDto) {
  try {
    const res = await api.post<CreateRoomRes>("/api/rooms", dto);
    return res.data;
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "스터디룸 생성에 실패했어요."));
  }
}
