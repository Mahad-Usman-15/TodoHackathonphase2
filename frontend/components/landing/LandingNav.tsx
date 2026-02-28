"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth_context";

export default function LandingNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-primary/20">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <span className="font-heading font-bold text-xl text-white">
          Taskify
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="font-body text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="font-body text-sm bg-brand-cta hover:bg-brand-cta-hover text-white rounded-lg px-4 py-2 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
