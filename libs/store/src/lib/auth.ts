import { create } from 'zustand';

type User = { id: string; email: string } | null;
type auth = 'login' | 'signup';

interface AuthStore {
  user: User;
  authType: string | null;
  setUser: (user: User) => void;
  logout: () => void;
  setAuthType: (authType: auth) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  authType: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  setAuthType: (authType) => set({ authType }),
}));
