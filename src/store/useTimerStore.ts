// src/store/useTimerStore.ts
import { create } from "zustand";

type TimerState = {
  timeLeft: number;
  isRunning: boolean;
  isModalOpen: boolean;               
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTimeLeft: (time: number) => void;
  setIsModalOpen: (open: boolean) => void;
};

export const useTimerStore = create<TimerState>((set, get) => {
  let timerRef: NodeJS.Timeout | null = null;

  return {
    timeLeft: 0,
    isRunning: false,
    isModalOpen: false,                  

    start: () => {
      if (get().isRunning || get().timeLeft <= 0) return;
      set({ isRunning: true });
      timerRef = setInterval(() => {
        const current = get().timeLeft;
        if (current > 0) {
          set({ timeLeft: current - 1 });
        }
      }, 1000);
    },

    pause: () => {
      if (timerRef) clearInterval(timerRef);
      set({ isRunning: false });
    },

    reset: () => {
      if (timerRef) clearInterval(timerRef);
      set({ isRunning: false, timeLeft: 0 });
    },

    setTimeLeft: (time) => set({ timeLeft: time }),
    setIsModalOpen: (open) => set({ isModalOpen: open }),
  };
});
