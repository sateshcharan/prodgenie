import { create } from 'zustand';
import {
  type User,
  type WorkspaceMember,
  type Workspace,
} from '@prisma/client';

type ExtendedUser = User & {
  memberships: (WorkspaceMember & { workspace: Workspace })[];
};

interface UserStore {
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
