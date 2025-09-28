"use client";

import { create } from "zustand";
import type { RoomSnapshot, RoomInfo, RoomMember } from "@/@types/room";

type State = {
  info: RoomInfo | null;
  members: RoomMember[];
};

type Actions = {
  load: (snapshot: RoomSnapshot) => void;
  clear: () => void;
};

export const useRoomStore = create<State & Actions>((set) => ({
  info: null,
  members: [],
  load: (snapshot) => set({ info: snapshot.info, members: snapshot.members }),
  clear: () => set({ info: null, members: [] }),
}));