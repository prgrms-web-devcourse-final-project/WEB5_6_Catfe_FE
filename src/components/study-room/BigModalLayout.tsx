"use client";

import clsx from "clsx";
import Image from "next/image";
import React from "react";

type BigModalLayoutProps = {
  open: boolean;
  onClose?: () => void;
  title: React.ReactNode;
  titleId?: string;
  rightSlot?: React.ReactNode;
  overlayClose?: boolean;
  className?: string;
  showDivider?: boolean;
  children: React.ReactNode;
};

function BigModalLayout({
  open,
  onClose,
  title,
  titleId,
  rightSlot,
  overlayClose = true,
  className,
  showDivider = true,
  children,
}: BigModalLayoutProps) {
  if (!open) return null;

  const onOverlayClick = () => {
    if (overlayClose && onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onOverlayClick}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx(
          "relative w-[750px] rounded-2xl border border-black/10 bg-white shadow-lg flex flex-col",
          className ?? "p-8"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header(통합) */}
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-xl font-bold text-text-primary">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {rightSlot}
            {onClose && (
              <button
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="cursor-pointer"
              >
                <Image src="/icon/study-room/close.svg" alt="닫기" width={20} height={20}/>
              </button>
            )}
          </div>
        </div>
        {showDivider && <hr className=" border-text-secondary/70 " />}

        {children}
      </div>
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
function Footer({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end ">{children}</div>;
}

BigModalLayout.Body = Body;
BigModalLayout.Footer = Footer;

export default BigModalLayout;