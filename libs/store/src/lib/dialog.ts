// libs/store/dialogStore.ts
import { create } from 'zustand';

interface DialogStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
