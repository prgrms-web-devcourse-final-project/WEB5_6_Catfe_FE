"use client";
import { createContext, useContext, useState } from "react";

export type MediaControls = {
  micOn: boolean;
  camOn: boolean;
  shareOn: boolean;
  toggleMic: () => void;
  toggleCam: () => void;
  toggleShare: () => void;
};

type CtxState = MediaControls | null;
type CtxSetter = (v: CtxState) => void;

const StateCtx = createContext<CtxState>(null);
const SetterCtx = createContext<CtxSetter | null>(null);

export function MediaControlsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CtxState>(null);
  return (
    <StateCtx.Provider value={state}>
      <SetterCtx.Provider value={setState}>{children}</SetterCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useMediaControls() {
  return useContext(StateCtx);
}

export function useSetMediaControls() {
  return useContext(SetterCtx);
}
