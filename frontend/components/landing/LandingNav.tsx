"use client";

import Link from "next/link";

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-primary/20">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <span className="font-heading font-bold text-xl text-white">
          Taskify
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="font-body text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="font-body text-sm bg-brand-cta hover:bg-brand-cta-hover text-white rounded-lg px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cta"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
