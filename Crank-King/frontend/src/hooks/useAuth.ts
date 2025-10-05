"use client";

import { useCallback, useEffect } from "react";
import { create } from "zustand";

import { apiClient } from "@/src/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  is_active: boolean;
}

interface SessionState {
  mode: "guest" | "auth";
  token: string | null;
  user: AuthUser | null;
  guestId: string | null;
  hydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setGuestId: (guestId: string | null) => void;
  setMode: (mode: "guest" | "auth") => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<SessionState>((set) => ({
  mode: "guest",
  token: null,
  user: null,
  guestId: null,
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
  setGuestId: (guestId) => {
    if (typeof window !== "undefined") {
      if (guestId) {
        localStorage.setItem("ck_guest_id", guestId);
      } else {
        localStorage.removeItem("ck_guest_id");
      }
    }
    set({ guestId });
  },
  setMode: (mode) => set({ mode }),
  setHydrated: (hydrated) => set({ hydrated }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ck_token");
    }
    set({ token: null, user: null, mode: "guest" });
  },
}));

export const useBootstrapAuth = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setGuestId = useAuthStore((state) => state.setGuestId);
  const setMode = useAuthStore((state) => state.setMode);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  const bootstrapGuest = useCallback(() => {
    const storedGuest =
      typeof window !== "undefined" ? localStorage.getItem("ck_guest_id") || undefined : undefined;
    apiClient
      .post("/guest/session", null, {
        headers: storedGuest ? { "X-Guest-Id": storedGuest } : undefined,
      })
      .then((res) => {
        setGuestId(res.data.id);
        setMode("guest");
      })
      .catch(() => {
        setGuestId(null);
        setMode("guest");
      })
      .finally(() => {
        setHydrated(true);
      });
  }, [setGuestId, setHydrated, setMode]);

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
          setMode("auth");
          setHydrated(true);
        })
        .catch(() => {
          localStorage.removeItem("ck_token");
          setToken(null);
          setUser(null);
          bootstrapGuest();
        });
    } else {
      bootstrapGuest();
    }
  }, [bootstrapGuest, setMode, setToken, setUser]);
};
