"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth_context";

export default function HomeGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Block rendering until auth is resolved
  if (isLoading) return null;

  // Redirect in progress — render nothing
  if (isAuthenticated) return null;

  return <>{children}</>;
}
