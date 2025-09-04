import { create } from 'zustand';

type ModalType =
  | 'auth:login'
  | 'auth:signup'
  | 'auth:resetPassword'
  | 'workspace:create'
  | 'workspace:delete'
  | 'workspace:deleteUser'
  | 'workspace:inviteUser'
  | 'workspace:editUserRole'
  | 'workspace:removeUserFromWorkspace'
  | 'workspace:fileUpload'
  | 'workspace:editThumbnail'
  | 'workspace:pricing'
  | 'workspace:leaveWorkspace'
  | 'workspace:replacePassword'
  | null;

interface ModalStore {
  isOpen: boolean;
  modalType: ModalType | null;
  modalProps: Record<string, any> | null;

  openModal: (type: ModalType, props?: Record<string, any>) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  modalType: null,
  modalProps: null,

  openModal: (type, props = {}) =>
    set({ isOpen: true, modalType: type, modalProps: props }),
  closeModal: () => set({ isOpen: false, modalType: null, modalProps: null }),
}));
