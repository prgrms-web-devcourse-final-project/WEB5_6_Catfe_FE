import { ConfirmOptions } from '@/@types/type';
import { create } from 'zustand';

type ConfirmState = {
  isOpen: boolean;
  options: Partial<ConfirmOptions>;
  resolver: ((value: boolean) => void) | null;
  open: (opts: ConfirmOptions) => Promise<boolean>;
  close: (v: boolean) => void;
  setBusy: (busy: boolean) => void;
  afterExit: () => void;
};

const DEFAULT_OPTIONS: ConfirmOptions = {
  tone: 'default',
  confirmText: '확인',
  cancelText: '취소',
};

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: {},
  resolver: null,
  open: (opts) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options: {
          ...DEFAULT_OPTIONS,
          ...opts,
        },
        resolver: resolve,
      });
    });
  },
  close: (v) => {
    const { resolver } = get();
    set({ isOpen: false });
    resolver?.(v);
    set({ resolver: null });
  },
  setBusy: (busy) => set((s) => ({ options: { ...s.options, busy } })),
  afterExit: () => set({ options: {} }),
}));
