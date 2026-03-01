"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  username: string;
  onLogout: () => void;
}

export default function DashboardHeader({
  username,
  onLogout,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  const navLinks = (
    <>
      <Link
        href="/dashboard"
        className={`font-body text-sm px-3 py-1.5 rounded-lg transition-colors ${
          pathname === "/dashboard"
            ? "text-brand-cta bg-brand-primary/20"
            : "text-white/60 hover:text-brand-cta"
        }`}
      >
        Tasks
      </Link>
      <Link
        href="/chat"
        className={`font-body text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
          pathname === "/chat"
            ? "text-brand-cta bg-brand-primary/20"
            : "text-white/60 hover:text-brand-cta"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        AI Agent
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-brand-bg border-b border-brand-primary/20 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4 py-3">
        {/* Main row: logo + (desktop nav) + right actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <h1 className="font-heading font-bold text-xl text-white">
              Taskify
            </h1>
            {/* Nav inline — desktop only */}
            <nav className="hidden sm:flex items-center gap-1">{navLinks}</nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:block font-body text-sm text-white/70">
              Hi, {username}
            </span>
            <button
              onClick={onLogout}
              className="font-body text-sm text-white/60 hover:text-brand-cta border border-brand-primary/30 hover:border-brand-cta rounded-lg px-3 py-1.5 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        {/* Mobile nav row — below logo on small screens */}
        <nav className="flex sm:hidden items-center gap-1 mt-2">{navLinks}</nav>
      </div>
    </header>
  );
}
