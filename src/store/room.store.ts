'use client';

import { create } from 'zustand';
import type {
  RoomSnapshot,
  RoomSnapshotUI,
  RoomInfo,
  RoomMember,
  UsersListItem,
} from '@/@types/rooms';

type State = {
  info: RoomInfo | null;
  members: UsersListItem[];
};

type Actions = {
  load: (snapshot: RoomSnapshot | RoomSnapshotUI) => void;
  setInfo: (info: RoomInfo | null) => void;
  setMembers: (m: UsersListItem[] | RoomMember[]) => void;
  clear: () => void;
};

export const useRoomStore = create<State & Actions>()((set) => ({
  info: null,
  members: [],

  load: (snapshot) =>
    set({
      info: snapshot.info,
      members: snapshot.members.map((m) => ({ ...m })) as UsersListItem[],
    }),

  setInfo: (info) => set({ info }),

  setMembers: (m) =>
    set({
      members: (m as RoomMember[]).map((x) => ({ ...x })) as UsersListItem[],
    }),

  clear: () => set({ info: null, members: [] }),
}));

// 추후 API 연결하며 온라인사용자 / 스터디룸에 멤버로 등록된 사용자 분리 예정
