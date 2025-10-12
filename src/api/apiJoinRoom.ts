import type { Role } from "@/@types/rooms";
import api from "@/utils/api";

type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
  success: boolean;
};

// 비공개방
export type JoinRoomReq = {
  password?: string;
};

export type JoinRoomOkData = {
  roomId: number;
  userId: number;
  role: Role;
  joinedAt: string;
};

// 에러 응답 형태
type ErrorData = string | {
  roomId: number;
  userId: number;
  role: Role;
  joinedAt: string;
};

/** API 호출 오류 사용 */
export class JoinRoomHttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly data: ErrorData | null;

  constructor(message: string, status: number, code: string, data: ErrorData | null) {
    super(message);
    this.name = "JoinRoomHttpError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

/** 방 입장 */
export async function joinRoom(
  roomId: number,
  body?: JoinRoomReq
): Promise<JoinRoomOkData> {
  const endpoint = `/api/rooms/${roomId}/join`;

  try {
    const response = await api.post<ApiEnvelope<JoinRoomOkData>>(endpoint, body ?? {});
    return response.data.data;
  } catch (err) {
    if (err instanceof Error && "response" in err) {
      const res = (err as { response: { status: number; data: ApiEnvelope<ErrorData> } }).response;
      const { status, data } = res;
      const { code, message, data: errData } = data;

      // 상태코드별 메시지
      const defaultMessage =
        status === 400
          ? "입장할 수 없습니다. 비밀번호 또는 인원이 잘못되었어요."
          : status === 401
          ? "로그인이 필요해요."
          : status === 404
          ? "존재하지 않는 방이에요."
          : "방 입장 중 오류가 발생했어요.";

      throw new JoinRoomHttpError(message || defaultMessage, status, code, errData ?? null);
    }

    // 예외 상황
    throw new JoinRoomHttpError("네트워크 오류가 발생했어요.", 0, "NETWORK_ERROR", null);
  }
}