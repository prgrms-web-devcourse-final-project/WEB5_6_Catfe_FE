'use client';

import { create } from 'zustand';

export type CommunityQuery = {
  q: string;
  subjects: string[];
  demographic: string;
  groupSize: string;
  page: number;
  size: number;
};

type S = {
  query: CommunityQuery;
  set: (next: Partial<CommunityQuery>) => void;
  setSize: (n: number) => void;
  reset: () => void;
};

export const useCommunityStore = create<S>((set) => ({
  query: { q: '', subjects: [], demographic: '', groupSize: '', page: 1, size: 12 },
  set: (next) => set((s) => ({ query: { ...s.query, ...next } })),
  setSize: (n) => set((s) => ({ query: { ...s.query, size: n, page: 1 } })),
  reset: () =>
    set({ query: { q: '', subjects: [], demographic: '', groupSize: '', page: 1, size: 12 } }),
}));
