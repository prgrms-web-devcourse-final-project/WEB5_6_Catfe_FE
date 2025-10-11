'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import RoomInfo, { RoomInfoValue } from './RoomInfo';
import RoomPassword from './RoomPassword';
import StudyRoomCard from './StudyRoomCard';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';
import Image from 'next/image';
import BigModal from '@/components/study-room/BigModalLayout';
import { createRoom } from '@/api/apiRooms';
import type { CreateRoomDto } from '@/@types/rooms';
import { useRouter } from 'next/navigation';

type Props = {
  open: boolean;
  onClose: () => void;
};

// 컨트롤드 초기값 상수
const INITIAL_INFO: RoomInfoValue = {
<<<<<<< HEAD
  title: '',
  description: '',
=======
  title: "",
  description: "",
>>>>>>> cc61f42 (feat: webrtc 기능 작성,차후 백엔드 갱신에따라 추가수정)
  maxParticipants: 2,
  isPrivate: false,
  coverPreviewUrl: null,
  coverUploadFile: null,
  password: '',
};

export default function CreateRoomModal({ open, onClose }: Props) {
  const router = useRouter();

  const [info, setInfo] = useState<RoomInfoValue>(INITIAL_INFO);
  const [privacy, setPrivacy] = useState({ enabled: false, password: '' });
  const [mediaEnabled, setMediaEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 모달 열릴 때마다 상태 리셋
  useEffect(() => {
    if (!open) return;
    setInfo(INITIAL_INFO);
    setPrivacy({ enabled: false, password: '' });
    setMediaEnabled(false);
    setSubmitting(false);
    setErrorMsg(null);
  }, [open]);

  // 하위 컴포넌트 onChange 핸들러
  const handleInfoChange = useCallback((v: RoomInfoValue) => setInfo(v), []);
  const handlePrivacyChange = useCallback(
    (v: { enabled: boolean; password: string }) => setPrivacy(v),
    []
  );

  // 버튼 활성화 조건
  const canCreate = useMemo(() => {
    const hasTitle = info.title.trim().length > 0;
    const needPwd = privacy.enabled ? privacy.password.trim().length > 0 : true;
    return hasTitle && needPwd && !submitting;
  }, [info.title, privacy.enabled, privacy.password, submitting]);

  const titleId = 'create-room-title';

  // 생성 (POST /api/rooms)
  const onCreate = async () => {
    setErrorMsg(null);

<<<<<<< HEAD
    // Data Transfer Object
    const base = {
      title: info.title.trim(),
      description: info.description.trim(),
      isPrivate: privacy.enabled,
      maxParticipants: info.maxParticipants,
      useWebRTC: mediaEnabled,
      password: '',
    };

    // 비공개/공개방에 따른 dto
    const dto: CreateRoomDto = privacy.enabled
      ? { ...base, password: privacy.password }
      : { ...base };

    // 프론트 유효성
    if (!dto.title) {
      setErrorMsg('스터디룸 이름을 입력해주세요.');
      return;
    }
    if (dto.isPrivate && !dto.password) {
      setErrorMsg('비공개 스터디룸의 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      const res = await createRoom(dto);
      const id = res?.data?.roomId;
      onClose();
      if (id) router.push(`/study-rooms/${id}`);
    } catch (err) {
      const msg =
        (typeof err === 'object' &&
          err &&
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          (err.response?.data?.message as string | undefined)) ||
        (err as Error)?.message ||
        '방 생성 중 오류가 발생했습니다.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
=======
  // Data Transfer Object
  const base = {
    title: info.title.trim(),
    description: info.description.trim(),
    isPrivate: privacy.enabled,
    maxParticipants: info.maxParticipants,
    useWebRTC: mediaEnabled,
    password:"",
>>>>>>> cc61f42 (feat: webrtc 기능 작성,차후 백엔드 갱신에따라 추가수정)
  };

  return (
    <BigModal
      open={open}
      onClose={onClose}
      title="스터디룸 생성"
      titleId={titleId}
      className="h-auto overflow-auto"
    >
      <BigModal.Body className="pt-8 px-8">
        <p className="mb-6 flex items-center gap-2.5">
          <Image src="/icon/study-room/makeUp.svg" alt="생성 아이콘" width={16} height={16} />
          스터디룸 정보
        </p>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* 좌측 */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-1 flex items-start justify-between">
                <div className="text-xs font-medium text-text-primary">
                  캠 / 보이스 / 화면공유 사용 여부
                </div>
                <Toggle checked={mediaEnabled} onChange={setMediaEnabled} />
              </div>
              {mediaEnabled ? (
                <p className="text-[10px] text-text-secondary">
                  해당 기능 사용 시, 스터디룸 최대 인원은 4명으로 제한됩니다. 스터디룸 생성 이후
                  변경이 불가합니다.
                </p>
              ) : null}
            </div>

            <RoomInfo value={info} onChange={handleInfoChange} mediaEnabled={mediaEnabled} />

            <RoomPassword
              enabled={privacy.enabled}
              password={privacy.password}
              onChange={handlePrivacyChange}
            />
          </div>

          {/* 우측: 미리보기 */}
          <div className="md:sticky md:top-4">
            <div className="mb-2 text-xs font-semibold text-text-primary">미리보기</div>
            <StudyRoomCard
              title={info.title || '[roomName]'}
              description={info.description || '간단한 소개를 입력해주세요'}
              coverSrc={info.coverPreviewUrl}
              isPrivate={privacy.enabled}
              clickable={false}
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {errorMsg ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {errorMsg}
          </div>
        ) : null}
      </BigModal.Body>

      <BigModal.Footer className="px-8 pb-8 pt-2">
        <Button
          size="md"
          borderType="solid"
          color="primary"
          hasIcon
          onClick={onCreate}
          aria-label="스터디룸 생성"
          disabled={!canCreate}
        >
          {submitting ? '생성 중...' : '생성'}
          <Image
            src="/icon/study-room/right.svg"
            alt="스터디룸 생성 아이콘"
            width={16}
            height={16}
          />
        </Button>
      </BigModal.Footer>
    </BigModal>
  );
}
