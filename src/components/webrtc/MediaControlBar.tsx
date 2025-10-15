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
  micOn, camOn, shareOn,
  onToggleMic, onToggleCam, onToggleShare,
  className = "",
}: Props) {
  return (
    <div className={["flex flex-col items-center gap-4 h-full w-full justify-center", className].join(" ")}>
      <IconButton
        active={micOn}
        label={micOn ? "마이크 끄기" : "마이크 켜기"}
        onClick={onToggleMic}
        iconOn={<IoIosMic size={20} />}
        iconOff={<IoIosMicOff size={20} color="var(--color-error-500)"/>}
      />
      <IconButton
        active={camOn}
        label={camOn ? "카메라 끄기" : "카메라 켜기"}
        onClick={onToggleCam}
        iconOn={<IoVideocamOutline size={20} />}
        iconOff={<IoVideocamOffOutline size={20} color="var(--color-error-500)"/>}
      />
      <IconButton
        active={shareOn}
        label={shareOn ? "화면공유 중지" : "화면공유 시작"}
        onClick={onToggleShare}
        iconOn={<LuScreenShare size={20} />}
        iconOff={<LuScreenShareOff size={20} color="var(--color-error-500)"/>}
      />
    </div>
  );
}

function IconButton({
  active, label, iconOn, iconOff, onClick,
}: {
  active: boolean; label: string;
  iconOn: React.ReactNode; iconOff: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={active}
      className={["p-2 rounded-full transition hover:bg-white/10", active ? "bg-white/10" : ""].join(" ")}
    >
      {active ? iconOn : iconOff}
    </button>
  );
}
