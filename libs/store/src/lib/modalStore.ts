import { create } from 'zustand';

// type ModalType = 'auth' | 'workspace';

interface ModalStore {
  isOpen: boolean;
  // modalType: ModalType | null;
  // openModal: (type: ModalType) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  modalType: null,
  // openModal: (type) => set({ isOpen: true, modalType: type }),
  // openModal: (type) => set({ isOpen: true }),
  openModal: () => set({ isOpen: true }),
  // closeModal: () => set({ isOpen: false, modalType: null }),
  closeModal: () => set({ isOpen: false }),
}));
