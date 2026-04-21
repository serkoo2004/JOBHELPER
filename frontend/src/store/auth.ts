"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id?: string;
  email: string;
  name?: string;
  avatar?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  profileId: string | null;
  hydrated: boolean;
  setAuth: (u: User, token: string) => void;
  setProfileId: (id: string) => void;
  logout: () => void;
  markHydrated: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      profileId: null,
      hydrated: false,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") localStorage.setItem("cc_token", token);
        set({ user, token });
      },
      setProfileId: (id) => set({ profileId: id }),
      markHydrated: () => set({ hydrated: true }),
      logout: () => {
        if (typeof window !== "undefined") localStorage.removeItem("cc_token");
        set({ user: null, token: null, profileId: null });
      }
    }),
    {
      name: "cc_auth",
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      }
    }
  )
);
