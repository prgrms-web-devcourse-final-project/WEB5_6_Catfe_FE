'use client';

import { ApiResponse, User, UserProfile } from '@/@types/type';
import Button from '@/components/Button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SettingAvatar from './SettingAvatar';
import { useConfirm } from '@/hook/useConfirm';
import showToast from '@/utils/showToast';
import Spinner from '@/components/Spinner';
import { Info } from 'lucide-react';
import { useUpdateUser, useUser } from '@/api/apiUsersMe';
import { apiUploadFile, MAX_FILE_SIZE } from '@/api/apiUploadFile';
import {
  ErrorMessages,
  FieldErrors,
  MAX_BIO_LIMIT,
  MAX_NICKNAME_LIMIT,
} from '@/lib/profileErrorCode';
import tw from '@/utils/tw';
import { AxiosError } from 'axios';

function SettingProfile() {
  const confirm = useConfirm();
  const { data: me, isLoading } = useUser();
  const { mutateAsync: saveProfile, isPending: saving } = useUpdateUser();

  const initial = useMemo(() => {
    if (!me) return null;
    const flat: Partial<User> & UserProfile = {
      userId: me.userId,
      username: me.username,
      email: me.email,
      nickname: me.profile.nickname ?? '',
      bio: me.profile.bio ?? '',
      profileImageUrl: me.profile.profileImageUrl ?? '',
      point: me.profile.point ?? 0,
    };
    return flat;
  }, [me]);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (!initial) return;
    setNickname(initial.nickname ?? '');
    setBio(initial.bio ?? '');
    setAvatarUrl(initial.profileImageUrl ?? '');
  }, [initial]);

  useEffect(() => {
    setFieldErrors((prev) => ({ ...prev, nickname: undefined }));
  }, [nickname]);

  useEffect(() => {
    setFieldErrors((prev) => ({ ...prev, bio: undefined }));
  }, [bio]);

  const hasChanged = useMemo(() => {
    if (!initial) return nickname !== '' || bio !== '' || avatarUrl !== '';
    return (
      (initial.nickname ?? '') !== nickname ||
      (initial.bio ?? '') !== bio ||
      (initial.profileImageUrl ?? '') !== avatarUrl
    );
  }, [initial, nickname, bio, avatarUrl]);

  const validateForm = useCallback((): boolean => {
    const errors: FieldErrors = {};
    const trimmedNickname = nickname.trim();
    const trimmedBio = bio.trim();

    if (trimmedNickname.length === 0) {
      errors.nickname = ErrorMessages.nicknameRequired;
    } else if (trimmedNickname.length > MAX_NICKNAME_LIMIT) {
      errors.nickname = ErrorMessages.nicknameTooLong;
    }

    if (trimmedBio.length > MAX_BIO_LIMIT) {
      errors.bio = ErrorMessages.bioTooLong;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [nickname, bio]);

  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true);
    showToast('info', '이미지 업로드 중...');

    if (file.size > MAX_FILE_SIZE) {
      showToast('error', ErrorMessages.fileTooLarge);
      setIsUploading(false);
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast('error', ErrorMessages.invalidFileType);
      setIsUploading(false);
      return;
    }

    try {
      const { url } = await apiUploadFile(file);
      setAvatarUrl(url);
      setIsEditing(true);
      showToast('success', '이미지가 업로드 되었습니다.');
    } catch (err) {
      const msg = (err as { message?: string }).message || '이미지 업로드에 실패했습니다.';
      showToast('error', msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const validateOk = validateForm();
    if (!validateOk) {
      showToast('error', '입력된 정보를 다시 확인해주세요.');
      return;
    }

    try {
      await saveProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        profileImageUrl: avatarUrl,
        birthDate: null,
      });
      showToast('success', '프로필이 저장되었습니다.');
      setIsEditing(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<User>>;
      let toastMessage = ErrorMessages.submitFail;
      const httpStatus = axiosError.response?.status;

      if (httpStatus === 500) {
        toastMessage = ErrorMessages.serverError;
        showToast('error', toastMessage);
        return;
      }
      const serverError = axiosError.response?.data as ApiResponse<User>;
      if (serverError && serverError.code) {
        switch (serverError.code) {
          // 409 Conflict: 닉네임 중복
          case 'USER_004':
            setFieldErrors((prev) => ({ ...prev, nickname: ErrorMessages.nicknameExists }));
            toastMessage = ErrorMessages.nicknameExists;
            break;
          // 410 Gone: 탈퇴 계정
          case 'USER_009':
            toastMessage = ErrorMessages.accountDeleted;
            break;
          // 403 Forbidden: 정지 계정 (USER_008) 또는 권한 없음 (AUTH_003)
          case 'USER_008':
            toastMessage = ErrorMessages.accountSuspended;
            break;
          case 'AUTH_003':
            toastMessage = ErrorMessages.permissionDenied;
            break;
          // 401 Unauthorized: 인증 에러
          case 'AUTH_001':
          case 'AUTH_002':
          case 'AUTH_004':
            toastMessage = ErrorMessages.authFailed;
            break;
          // 404 Not Found: 사용자 없음
          case 'USER_001':
            toastMessage = ErrorMessages.userNotFound;
            break;
          // 500 Internal Server Error
          case 'COMMON_500':
            toastMessage = ErrorMessages.serverError;
            break;
          // Rate Limit (너무 잦은 요청)
          case 'TOO_MANY_REQUESTS': // 가정된 Rate Limit 코드
            toastMessage = ErrorMessages.tooManyRequests;
            break;
          default:
            toastMessage = serverError.message || ErrorMessages.submitFail;
            break;
        }
      } else if (err instanceof Error && err.message.includes('Failed to fetch')) {
        toastMessage = ErrorMessages.networkError;
      } else {
        toastMessage = ErrorMessages.unexpected;
      }
      showToast('error', toastMessage);
    }
  };

  const handleCancel = async () => {
    if (hasChanged) {
      const ok = await confirm({
        title: '정보 변경을 취소하시겠습니까?',
        description: <>변경 중인 사항은 저장되지 않습니다.</>,
        confirmText: '취소하기',
        cancelText: '돌아가기',
        tone: 'danger',
      });
      if (!ok) return;
    }
    setNickname(initial?.nickname ?? '');
    setBio(initial?.bio ?? '');
    setAvatarUrl(initial?.profileImageUrl ?? '');
    setIsEditing(false);
    setFieldErrors({});
  };

  if (isLoading) return <Spinner />;
  const errorClassName = 'text-error-500 text-xs mt-1';
  const inputErrorClassName = 'border-error-500 ring-error-500';

  return (
    <section className="flex flex-col gap-5 w-full">
      <h3>프로필 설정</h3>
      <hr />
      <div className="flex gap-8">
        <div className="w-2/3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="block font-light text-sm">ID</span>
            <span className="block">{initial?.username}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="block font-light text-sm">이메일</span>
            <span className="block">{initial?.email}</span>
          </div>
          {/* Nickname */}
          <div className="flex flex-col gap-2">
            <label htmlFor="user-name-setting" className="font-light text-sm">
              닉네임
            </label>
            <input
              type="text"
              id="user-name-setting"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsEditing(true);
              }}
              className={tw(
                'w-full rounded-md border border-gray-300 bg-background-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-400 appearance-none',
                fieldErrors.nickname ? inputErrorClassName : ''
              )}
            />
            {fieldErrors.nickname ? (
              <p className={errorClassName} aria-live="polite">
                {fieldErrors.nickname}
              </p>
            ) : (
              <span className="font-light text-xs text-zinc-400 text-left flex gap-1">
                <Info className="w-4 h-4" />
                스터디룸에서 표시될 이름입니다. (최대 {MAX_NICKNAME_LIMIT}자)
              </span>
            )}
          </div>
          {/* Bio */}
          <div className="flex flex-col gap-2">
            <label htmlFor="user-bio-setting" className="font-light text-sm">
              자기소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setIsEditing(true);
              }}
              rows={6}
              placeholder="자기소개를 입력해주세요"
              aria-describedby="bio-help bio-error"
              className={tw(
                'w-full rounded-lg border border-zinc-300 p-3 outline-none focus:ring-1 focus:ring-secondary-400 bg-background-white text-sm resize-none',
                fieldErrors.bio ? inputErrorClassName : ''
              )}
              maxLength={MAX_BIO_LIMIT}
            />
            <div className="flex items-center justify-end text-sm text-text-secondary/50">
              <span>
                <strong className={bio.length >= MAX_BIO_LIMIT ? 'text-error-500' : ''}>
                  {bio.length}
                </strong>{' '}
                / {MAX_BIO_LIMIT}
              </span>
              {fieldErrors.bio && <p className={errorClassName}>{fieldErrors.bio}</p>}
            </div>
          </div>
        </div>
        {/* Avatar */}
        <div className="w-1/3">
          <SettingAvatar
            avatarUrl={avatarUrl}
            onChange={handleAvatarUpload}
            disabled={isUploading}
          />
        </div>
      </div>
      <Button
        size="md"
        className="rounded-full mx-auto"
        onClick={handleSave}
        disabled={!isEditing || !hasChanged || saving || isUploading}
      >
        {saving ? '저장 중...' : isUploading ? '업로드 중...' : '변경사항 저장'}
      </Button>
      {isEditing && (
        <Button
          size="md"
          borderType="outline"
          className="rounded-full mx-auto"
          onClick={handleCancel}
        >
          취소
        </Button>
      )}
    </section>
  );
}
export default SettingProfile;
