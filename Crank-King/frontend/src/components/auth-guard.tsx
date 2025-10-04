"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { useAuthStore } from "@/src/hooks/useAuth";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { token, hydrated } = useAuthStore((state) => ({
    token: state.token,
    hydrated: state.hydrated,
  }));

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return <div className="flex h-screen items-center justify-center">로딩중...</div>;
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
