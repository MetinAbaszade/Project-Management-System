import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: string;
};

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  hasHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        localStorage.removeItem('authToken');
      },
    }),
    {
      name: 'taskup-user-store',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
