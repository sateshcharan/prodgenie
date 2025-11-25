import { create } from 'zustand';
import {
  type user,
  type workspaceMember,
  type workspace,
} from '@prisma/client';

type ExtendedUser = user & {
  memberships: (workspaceMember & { workspace: workspace })[];
};

interface UserStore {
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
