import { MAX_FILE_SIZE } from '@/api/apiUploadFile';

export const MAX_NICKNAME_LIMIT = 20;
export const MAX_BIO_LIMIT = 250;

export type FieldErrors = Partial<{
  nickname: string;
  bio: string;
  profileImageUrl: string;
  global: string;
}>;

export const ErrorMessages = {
  // 서버 응답 에러
  authFailed: '인증이 필요하거나 만료되었습니다. 다시 로그인해주세요.',
  permissionDenied: '요청을 수행할 권한이 없습니다.',
  nicknameExists: '이미 사용 중인 닉네임입니다.',
  accountDeleted: '이미 탈퇴한 계정입니다.',
  accountSuspended: '정지된 계정입니다. 관리자에게 문의하세요.',
  userNotFound: '존재하지 않는 사용자입니다.',
  serverError: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  submitFail: '프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',

  // 파일 업로드 에러
  fileUploadFail: '파일을 업로드하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  avatarUploadFail: '프로필 이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해주세요.',
  uploadRateLimited: '업로드 요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',

  // 클라이언트 유효성 검사 에러
  fileTooLarge: `업로드할 수 있는 파일 용량(${MAX_FILE_SIZE}MB)을 초과했습니다.`,
  invalidFileType: '이미지 파일만 업로드하실 수 있습니다.',
  nicknameTooLong: `닉네임은 최대 ${MAX_NICKNAME_LIMIT}자까지 입력할 수 있습니다.`,
  nicknameRequired: '닉네임은 필수값입니다.',
  bioTooLong: `자기소개는 최대 ${MAX_BIO_LIMIT}자까지 입력할 수 있습니다.`,
  tooManyRequests: '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',

  networkError: '네트워크 연결에 문제가 있습니다. 연결을 확인하신 뒤 다시 시도해주세요.',
  unexpected: '예기치 못한 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
};
