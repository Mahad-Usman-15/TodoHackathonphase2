"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "error" | "success";
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl shadow-brand-bg/50 backdrop-blur-sm bg-brand-deep/95 border border-brand-primary/30 ${
        type === "error"
          ? "border-l-4 border-l-brand-cta"
          : "border-l-4 border-l-green-500/70"
      }`}
      role="alert"
    >
      <span className="font-body text-sm text-white">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 rounded p-0.5 text-white/40 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
