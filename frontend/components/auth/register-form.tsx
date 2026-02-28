"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth_context";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !username || !password) {
      setError("All fields are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ email, username, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          htmlFor="username"
          className="block font-body text-sm text-white/70 mb-1"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="yourname"
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

      <div>
        <label
          htmlFor="confirmPassword"
          className="block font-body text-sm text-white/70 mb-1"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center font-body text-sm text-white/60">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-brand-cta hover:text-brand-cta-hover font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
