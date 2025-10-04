"use client";

import { useEffect } from "react";
import { create } from "zustand";

import { apiClient } from "@/src/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  is_active: boolean;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("ck_token", token);
      } else {
        localStorage.removeItem("ck_token");
      }
    }
    set({ token });
  },
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ck_token");
    }
    set({ token: null, user: null });
  },
}));

export const useBootstrapAuth = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const token = localStorage.getItem("ck_token");
    if (token) {
      setToken(token);
      apiClient
        .get("/auth/me")
        .then((res) => {
          setUser(res.data);
          setHydrated(true);
        })
        .catch(() => {
          localStorage.removeItem("ck_token");
          setToken(null);
          setUser(null);
          setHydrated(true);
        });
    } else {
      setHydrated(true);
    }
  }, [setToken, setUser, setHydrated]);
};
