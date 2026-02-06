import { create } from 'zustand';

type PlayerState = {
  muted: boolean;
  volume: number;
  setMuted: (v: boolean) => void;
  setVolume: (v: number) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  muted: false,
  volume: 0.8,
  setMuted: (v) => set({ muted: v }),
  setVolume: (v) => set({ volume: v })
}));
