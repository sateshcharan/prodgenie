// libs/store/src/auth.ts
import { create } from 'zustand';

type User = { id: string; email: string } | null;

interface AuthStore {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
