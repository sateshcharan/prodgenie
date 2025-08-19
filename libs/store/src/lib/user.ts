import { create } from 'zustand';

import { type User as UserType } from '@prisma/client';

// type User = {
//   name: string;
//   type: string;
//   email: string;
//   avatar: string;
//   id: string;
//   org?: {
//     id: string;
//     name: string;
//     credits: number;
//   };
// } | null;

type User = UserType | null;

interface UserStore {
  user: User;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
