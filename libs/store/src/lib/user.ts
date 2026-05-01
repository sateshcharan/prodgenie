import { create } from 'zustand';

import {
  type user,
  type workspaceMember,
  type workspace,
} from '@prisma/client';

type ExtendedWorkspace = workspace & {
  plan: {
    name: string;
  } | null;
};

type ExtendedUser = user & {
  memberships: (workspaceMember & { workspace: ExtendedWorkspace })[];
};

interface UserStore {
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
