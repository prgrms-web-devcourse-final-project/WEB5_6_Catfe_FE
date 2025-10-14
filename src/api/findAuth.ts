import api from "@/utils/api";

/** 서버 공통 응답 래퍼 */
export type ApiEnvelope<T = unknown> = {
  success: boolean;
  code: string;    
  message: string;
  data: T | null;
};

export class ApiError extends Error {
  readonly code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

/** 에러 코드 → 사용자 메시지 매핑 */
export function mapFindPwError(code?: string): string {
  switch (code) {
    case "USER_001":
      return "존재하지 않는 사용자입니다.";
    case "COMMON_400":
      return "잘못된 요청입니다. 입력 값을 확인해주세요.";
    case "TOKEN_003":
      return "유효하지 않은(또는 만료된) 토큰입니다. 다시 요청해주세요.";
    case "USER_005":
      return "비밀번호는 최소 8자 이상, 숫자/특수문자를 포함해야 합니다.";
    default:
      return "요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
}

/** 비밀번호 재설정 이메일 요청 */
export async function requestPasswordRecover(email: string): Promise<void> {
  const { data } = await api.post<ApiEnvelope>("/api/auth/password/recover", { email });
  if (!data.success) {
    throw new ApiError(data.message, data.code);
  }
}

/** 토큰 + 새 비밀번호로 비밀번호 재설정 */
export async function resetPasswordWithToken(params: { token: string; newPassword: string }): Promise<void> {
  const { data } = await api.post<ApiEnvelope>("/api/auth/password/reset", params);
  if (!data.success) {
    throw new ApiError(data.message, data.code);
  }
}
