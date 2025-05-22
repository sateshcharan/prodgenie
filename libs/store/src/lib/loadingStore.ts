import { create } from 'zustand';

type LoadingStore = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));
