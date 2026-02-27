"use client";

import { AuthProvider } from "@/contexts/auth_context";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
