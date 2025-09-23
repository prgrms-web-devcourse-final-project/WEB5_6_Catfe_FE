'use client';

import { create } from 'zustand';

export type CommunityQuery = {
  q: string;
  categories: string[];
  page: number;
  size: number;
};

type S = {
  query: CommunityQuery;
  set: (next: Partial<CommunityQuery>) => void;
  reset: () => void;
};

export const useCommunityStore = create<S>((set) => ({
  query: { q: '', categories: [], page: 1, size: 12 },
  set: (next) => set((s) => ({ query: { ...s.query, ...next } })),
  reset: () => set({ query: { q: '', categories: [], page: 1, size: 12 } }),
}));
