import { create } from 'zustand';

type AuthModalType = 'login' | 'signup' | null;

interface AuthModalStore {
  modalType: AuthModalType;
  openModal: (type: AuthModalType) => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  modalType: null,
  openModal: (type) => set({ modalType: type }),
  closeModal: () => set({ modalType: null }),
}));
