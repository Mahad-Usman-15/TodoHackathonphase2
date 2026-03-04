"use client";

import { AuthProvider, useAuth } from "@/contexts/auth_context";
import BottomNav from "@/components/layout/BottomNav";

function AuthLoadingGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0C0C0C] flex items-center justify-center z-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F2613F] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {children}
      {isAuthenticated && <BottomNav />}
    </>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthLoadingGuard>{children}</AuthLoadingGuard>
    </AuthProvider>
  );
}
