import { create } from 'zustand';

interface WorkspaceModalStore {
  modalType: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useWorkspaceModalStore = create<WorkspaceModalStore>((set) => ({
  modalType: false,
  openModal: () => set({ modalType: true }),
  closeModal: () => set({ modalType: false }),
}));
