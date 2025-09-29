'use client';

import { ConfirmOptions } from '@/@types/type';
import { useConfirmStore } from '@/store/useConfirmStore';
import tw from '@/utils/tw';
import gsap from 'gsap';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  open: boolean;
  onClose: (v: boolean) => void;
  options: ConfirmOptions;
}

function ConfirmModal({ open, onClose, options }: ConfirmModalProps) {
  // Default Values
  const {
    title = '확인',
    description,
    confirmText = '확인',
    cancelText = '취소',
    tone = 'default',
    icon,
    busy,
  } = options;

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const openingGuardRef = useRef(0);

  const [render, setRender] = useState(open);
  const [mounted, setMounted] = useState<boolean>(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Mount state
  useEffect(() => {
    setMounted(true);
    setContainer(document.body);
  }, []);

  // Reduced Motion
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = prefersReduced ? 0 : 0.24; // panel
  const DURATION_OV = prefersReduced ? 0 : 0.2; // overlay

  useEffect(() => {
    if (open) openingGuardRef.current = performance.now();
  }, [open]);

  useLayoutEffect(() => {
    if (!render) return;

    gsap.set(overlayRef.current, { autoAlpha: 0 });
    gsap.set(dialogRef.current, { autoAlpha: 0, y: 8, scale: 0.95 });

    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;

    if (overlayRef.current) {
      tl.fromTo(
        overlayRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: DURATION_OV, ease: 'power2.out' },
        0
      );
    }

    if (dialogRef.current) {
      tl.fromTo(
        dialogRef.current,
        { autoAlpha: 0, y: 8, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: DURATION, ease: 'power2.out' },
        0.02
      );
    }

    tl.eventCallback('onReverseComplete', () => {
      setRender(false);
      useConfirmStore.getState().afterExit();
    });

    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [render, DURATION, DURATION_OV]);

  useEffect(() => {
    if (open) {
      if (!render) {
        setRender(true);
      } else {
        tlRef.current?.play(0);
      }
    } else {
      if (tlRef.current) {
        tlRef.current.reverse();
      } else {
        setRender(false);
      }
    }
  }, [open, render]);

  // Focusing & Escape Close
  useEffect(() => {
    if (!open) return;

    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      (confirmBtnRef.current ?? cancelBtnRef.current)?.focus();
    }, 0);

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(false);
      } else if (e.key === 'Tab') {
        const focusable: HTMLElement[] = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) || []
        ).filter((el) => !el.hasAttribute('disabled'));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', handleKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  // Outside Click Close
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (performance.now() - openingGuardRef.current < 100) return;

    if (e.target === overlayRef.current) onClose(false);
  };

  if (!mounted || !container) return null;
  if (!render) return null;

  // Style
  let confirmBtnClass = '';
  switch (tone) {
    case 'danger':
      confirmBtnClass =
        'bg-error-500 text-secondary-50 hover:bg-error-600 focus-visible:outline-primary-500';
      break;
    case 'success':
      confirmBtnClass =
        'bg-success-500 text-secondary-50 hover:bg-success-600 focus-visible:outline-success-700';
      break;
    case 'default':
    default:
      confirmBtnClass =
        'bg-slate-800 text-secondary-50 hover:bg-slate-900 focus-visible:outline-slate-900';
      break;
  }

  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={onOverlayClick}
      className="fixed inset-0 z-[1000] flex justify-center items-center bg-black/40 backdrop-blur-xs"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="w-[90vw] max-w-md rounded-2xl bg-background-base shadow-2xl ring-2 ring-primary-900/5"
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            {icon ? <div className="mt-3 shrink-0">{icon}</div> : null}
            <div className="min-w-0">
              <h2 id="confirm-title" className="text-lg font-semibold tracking-tight mb-2">
                {title}
              </h2>
              {description && (
                <div id="confirm-desc" className="text-sm text-text-primary">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 p-6 pt-0">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={() => onClose(false)}
            disabled={!!busy}
            className="w-1/2 inline-flex justify-center items-center rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-text-primary cursor-pointer hover:bg-secondary-100"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => onClose(true)}
            disabled={!!busy}
            className={tw(
              'w-1/2 inline-flex justify-center items-center rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
              confirmBtnClass
            )}
          >
            {busy ? '처리 중...' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    container
  );
}
export default ConfirmModal;

export function ConfirmHost() {
  const open = useConfirmStore((s) => s.isOpen);
  const options = useConfirmStore((s) => s.options);
  const close = useConfirmStore((s) => s.close);

  return <ConfirmModal open={open} options={options} onClose={close} />;
}
