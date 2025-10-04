"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

import { useBootstrapAuth } from "@/src/hooks/useAuth";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  useBootstrapAuth();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
