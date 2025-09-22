"use client";

import { useState, useCallback, useMemo } from "react";
import RoomInfo, { RoomInfoValue } from "./RoomInfo";
import RoomPassword from "./RoomPassword";
import StudyRoomCard from "./StudyRoomCard";
import MakeIcon from "@/aseets/icons/right.svg";
import CleanIcon from "@/aseets/icons/clean.svg";
import Toggle from "@/components/Toggle";
import Button from "@/components/Button";
import Image from "next/image";
import clsx from "clsx";

import BigModal from "@/components/study-room/BigModalLayout";

export default function CreateRoomModal() {
  const [open, setOpen] = useState(true);
  const [info, setInfo] = useState<RoomInfoValue>({
    title: "",
    description: "",
    maxMember: 2,
    isPrivate: false,
    coverPreviewUrl: null,
    coverUploadFile: null,
  });
  const [privacy, setPrivacy] = useState({ enabled: false, password: "" });
  const [mediaEnabled, setMediaEnabled] = useState(false);

  const handleInfoChange = useCallback((v: RoomInfoValue) => setInfo(v), []);
  const handlePrivacyChange = useCallback(
    (v: { enabled: boolean; password: string }) => setPrivacy(v),
    []
  );

  const onCreate = () => {
    const payload = {
      title: info.title,
      description: info.description,
      maxMember: info.maxMember,
      isPrivate: privacy.enabled,
      password: privacy.enabled ? privacy.password : undefined,
      mediaEnabled,
      coverUploadFile: info.coverUploadFile,
    };
    console.log("CREATE ROOM:", payload);
    // todo: 백엔드 API 연동
  };

  const canCreate = useMemo(() => {
    const hasTitle = info.title.trim().length > 0;
    const needPwd = privacy.enabled ? privacy.password.trim().length > 0 : true;
    return hasTitle && needPwd;
  }, [info.title, privacy.enabled, privacy.password]);

  const titleId = "create-room-title";

  return (
    <BigModal
      open={open}
      onClose={() => setOpen(false)}
      title="스터디룸 생성"
      titleId={titleId}
      className={clsx("p-8 gap-5")}
    >
      <BigModal.Body>
        <p className="flex gap-2.5 mb-6 items-center">
          <Image src={CleanIcon} alt="" className="w-4 h-4" />
          스페이스 정보
        </p>

        {/*메인 블록*/}
        <div className="grid grid-cols-2 gap-10">
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
                  해당 기능 사용 시, 스터디룸 최대 인원은 4명으로 제한됩니다.
                  스터디룸 생성 이후 변경이 불가합니다.
                </p>
              ) : null}
            </div>

            {/* 스터디룸 정보 */}
            <RoomInfo
              defaultValue={info}
              onChange={handleInfoChange}
              mediaEnabled={mediaEnabled}
            />

            {/* 비공개 여부 */}
            <RoomPassword
              defaultEnabled={privacy.enabled}
              defaultPassword={privacy.password}
              onChange={handlePrivacyChange}
            />
          </div>

          {/* 우측: 미리보기 */}
          <div className="sticky top-4">
            <div className="mb-2 text-xs font-semibold text-text-primary">
              미리보기
            </div>
            <StudyRoomCard
              title={info.title || "[roomName]"}
              description={info.description || "간단한 소개를 입력해주세요"}
              coverSrc={info.coverPreviewUrl}
              isPrivate={privacy.enabled}
              clickable={false}
            />
          </div>
        </div>
      </BigModal.Body>

      <BigModal.Footer>
        <Button
          size="md"
          borderType="solid"
          color="primary"
          hasIcon
          onClick={onCreate}
          aria-label="스터디룸 생성"
          disabled={!canCreate}
        >
          생성
          <Image src={MakeIcon} alt="스터디룸 생성 아이콘" />
        </Button>
      </BigModal.Footer>
    </BigModal>
  );
}
