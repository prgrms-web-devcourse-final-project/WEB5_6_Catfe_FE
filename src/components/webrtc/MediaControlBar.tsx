"use client";

import { IoVideocamOutline, IoVideocamOffOutline } from "react-icons/io5";
import { IoIosMic, IoIosMicOff } from "react-icons/io";
import { LuScreenShare, LuScreenShareOff } from "react-icons/lu";

type Props = {
  micOn: boolean;
  camOn: boolean;
  shareOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleShare: () => void;
  className?: string;
};

export default function MediaControlBar({
  micOn,
  camOn,
  shareOn,
  onToggleMic,
  onToggleCam,
  onToggleShare,
  className = "",
}: Props) {
  return (
    <div
      className={[
        // 위치/컨테이너
        "fixed left-1/2 -translate-x-1/2 bottom-6 z-40",
        "h-10 min-w-[200px]",
        // 외형
        "rounded-full border border-[color:var(--color-text-primary)] bg-transparent",
        // 내용
        "flex items-center justify-center gap-2 px-2",
        className,
      ].join(" ")}
      style={{ color: "var(--color-text-primary)" }}
      aria-label="미디어 컨트롤 바"
    >
      <IconButton
        active={micOn}
        label={micOn ? "마이크 끄기" : "마이크 켜기"}
        onClick={onToggleMic}
        iconOn={<IoIosMic size={20} />}
        iconOff={
          <IoIosMicOff size={20} color="var(--color-error-500)" />
        }
      />
      <IconButton
        active={camOn}
        label={camOn ? "카메라 끄기" : "카메라 켜기"}
        onClick={onToggleCam}
        iconOn={<IoVideocamOutline size={20} />}
        iconOff={
          <IoVideocamOffOutline size={20} color="var(--color-error-500)" />
        }
      />
      <IconButton
        active={shareOn}
        label={shareOn ? "화면공유 중지" : "화면공유 시작"}
        onClick={onToggleShare}
        iconOn={<LuScreenShare size={20} />}
        iconOff={
          <LuScreenShareOff size={20} color="var(--color-error-500)" />
        }
      />
    </div>
  );
}

function IconButton({
  active,
  label,
  iconOn,
  iconOff,
  onClick,
}: {
  active: boolean;
  label: string;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-10 w-10 rounded-full grid place-items-center transition",
        "hover:bg-black focus:outline-none focus:ring-2",
      ].join(" ")}
      aria-pressed={active ? true : undefined}
      aria-label={label}
      title={label}
    >
      {active ? iconOn : iconOff}
    </button>
  );
}
