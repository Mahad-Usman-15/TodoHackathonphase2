"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 sm:hidden bg-gray-900 border-t border-gray-800 flex h-16 z-40"
    >
      <Link
        href="/dashboard"
        aria-label="Tasks"
        className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-inset ${
          pathname === "/dashboard" ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
        <span>Tasks</span>
      </Link>

      <Link
        href="/chat"
        aria-label="AI Chat"
        className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-inset ${
          pathname === "/chat" ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>AI Chat</span>
      </Link>
    </nav>
  );
}
