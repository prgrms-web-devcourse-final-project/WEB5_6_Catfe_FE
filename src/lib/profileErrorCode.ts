export type FieldErrors = Partial<{
  nickname: string;
  bio: string;
  profileImageUrl: string;
  global: string;
}>;

export const ErrorMessages = {
  loginSessionExpired: '로그인 정보가 만료되었습니다. 다시 로그인해주세요.',
  permissionDenied: '요청을 수행할 권한이 없습니다.',

  fileUploadFail: '파일을 업로드하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  avatarUploadFail: '프로필 이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해주세요.',
  fileTooLarge: '업로드할 수 있는 파일 용량(2MB)을 초과했습니다.',
  invalidFileType: '이미지 파일만 업로드하실 수 있습니다.',
  uploadRateLimited: '업로드 요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',

  nicknameExists: '이미 사용 중인 닉네임입니다.',
  nicknameTooLong: '닉네임은 최대 20자까지 입력할 수 있습니다.',
  nicknameRequired: '닉네임은 필수값입니다.',

  bioTooLong: '자기소개는 최대 300자까지 입력할 수 있습니다.',

  submitFail: '프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
  tooManyRequests: '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',

  networkError: '네트워크 연결에 문제가 있습니다. 연결을 확인하신 뒤 다시 시도해주세요.',
  unexpected: '예기치 못한 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
};
