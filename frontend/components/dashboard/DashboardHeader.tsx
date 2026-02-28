"use client";

interface DashboardHeaderProps {
  username: string;
  onLogout: () => void;
}

export default function DashboardHeader({
  username,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-brand-bg border-b border-brand-primary/20 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <h1 className="font-heading font-bold text-xl text-white">
          Taskify
        </h1>
        <div className="flex items-center gap-4">
          <span className="font-body text-sm text-white/70">
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
    </header>
  );
}
