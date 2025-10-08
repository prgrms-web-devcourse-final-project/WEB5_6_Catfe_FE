import api from "@/utils/api";
import type { CreateRoomDto, CreateRoomRes, MyRoomsList } from "@/@types/rooms";

/** 프론트 표준 페이지 응답 */
export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  number: number;
  totalElements?: number;
  size?: number;
};

/**  Response 틀 */
type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
  success: boolean;
};

function safeErrorMessage(err: unknown, fallback = "요청 처리 중 오류가 발생했어요.") {
  const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
  return anyErr?.response?.data?.message ?? anyErr?.message ?? fallback;
}

/** 내 캣페 목록 조회 */
export async function getMyRooms(page: number, size: number): Promise<PageResponse<MyRoomsList>> {
  try {
    const res = await api.get<ApiEnvelope<MyRoomsList[] | PageResponse<MyRoomsList>>>(
      "/api/rooms/my",
      { params: { page, size } }
    );

    const payload = res.data.data;

    // 배열로 온 data 페이징
    if (Array.isArray(payload)) {
      const totalElements = payload.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / size));
      const start = page * size;
      const end = start + size;

      return {
        content: payload.slice(start, end),
        totalPages,
        number: page,
        size,
        totalElements,
      };
    }

    // 서버가 PageResponse로 변경되었을 때
    return {
      content: payload.content ?? [],
      totalPages: typeof payload.totalPages === "number" ? payload.totalPages : 1,
      number: typeof payload.number === "number" ? payload.number : page,
      size: typeof payload.size === "number" ? payload.size : size,
      totalElements:
        typeof payload.totalElements === "number" ? payload.totalElements : payload.content?.length ?? 0,
    };
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "내 캣페 목록을 불러오지 못했어요."));
  }
}

/** 스터디룸 생성 */
export async function createRoom(dto: CreateRoomDto): Promise<CreateRoomRes> {
  try {
    const res = await api.post<ApiEnvelope<CreateRoomRes>>("/api/rooms", dto);
    return res.data.data;
  } catch (err: unknown) {
    throw new Error(safeErrorMessage(err, "스터디룸 생성에 실패했어요."));
  }
}
