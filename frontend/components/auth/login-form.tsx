"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth_context";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isExpired && !error && (
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 font-body text-sm text-yellow-400">
          Your session has expired — please log in again.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-brand-cta/10 border border-brand-cta/30 p-3 font-body text-sm text-brand-cta/90">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block font-body text-sm text-white/70 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-lg bg-brand-bg border border-brand-primary/30 px-3 py-2 font-body text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-cta focus:ring-1 focus:ring-brand-cta transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block font-body text-sm text-white/70 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full rounded-lg bg-brand-bg border border-brand-primary/30 px-3 py-2 font-body text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-cta focus:ring-1 focus:ring-brand-cta transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="relative w-full font-heading font-semibold text-sm bg-brand-cta hover:bg-brand-cta-hover text-white rounded-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center font-body text-sm text-white/60">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-brand-cta hover:text-brand-cta-hover font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
