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
import { apiUploadFile } from '@/api/apiUploadFile';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';

type Props = {
  open: boolean;
  onClose: () => void;
};

const INITIAL_INFO: RoomInfoValue = {
  title: '',
  description: '',
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

  useEffect(() => {
    if (!open) return;
    setInfo(INITIAL_INFO);
    setPrivacy({ enabled: false, password: '' });
    setMediaEnabled(false);
    setSubmitting(false);
    setErrorMsg(null);
  }, [open]);

  const handleInfoChange = useCallback((v: RoomInfoValue) => setInfo(v), []);
  const handlePrivacyChange = useCallback(
    (v: { enabled: boolean; password: string }) => setPrivacy(v),
    []
  );

  const canCreate = useMemo(() => {
    const hasTitle = info.title.trim().length > 0;
    const needPwd = privacy.enabled ? privacy.password.trim().length > 0 : true;
    return hasTitle && needPwd && !submitting;
  }, [info.title, privacy.enabled, privacy.password, submitting]);

  const titleId = 'create-room-title';

  const onCreate = async () => {
    setErrorMsg(null);

    const maxP = mediaEnabled ? Math.min(info.maxParticipants ?? 4, 4) : info.maxParticipants;

    const base: CreateRoomDto = {
      title: info.title.trim(),
      description: info.description.trim(),
      isPrivate: privacy.enabled,
      maxParticipants: maxP,
      useWebRTC: mediaEnabled,
    };

    if (privacy.enabled) {
      base.password = privacy.password;
    } else {
      delete base.password;
    }

    if (!base.title) {
      setErrorMsg('스터디룸 이름을 입력해주세요.');
      return;
    }
    if (base.isPrivate && !base.password) {
      setErrorMsg('비공개 스터디룸의 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      if (info.coverUploadFile) {
        const { attachmentId } = await apiUploadFile(info.coverUploadFile);
        base.thumbnailAttachmentId = attachmentId;
      }

      const res = await createRoom(base);
      const id = res?.roomId;
      onClose();
      if (id) router.push(`/study-rooms/${id}`);
    } catch (err) {
      const msg =
        (isAxiosError(err) && (err.response?.data as { message?: string } | undefined)?.message) ||
        (err instanceof Error && err.message) ||
        '방 생성 중 오류가 발생했습니다.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
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
