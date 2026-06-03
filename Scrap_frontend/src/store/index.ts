import { create } from 'zustand';

interface AppState {
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isHydrated: false,
  setHydrated: (state) => set({ isHydrated: state }),
}));
