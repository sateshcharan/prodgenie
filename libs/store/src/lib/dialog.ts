import { create } from 'zustand';

interface DialogStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useAddDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const useEditDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
