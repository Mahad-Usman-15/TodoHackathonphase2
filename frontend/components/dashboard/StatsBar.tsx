"use client";

import type { Task } from "@/types";

interface StatsBarProps {
  tasks: Task[];
}

export default function StatsBar({ tasks }: StatsBarProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const stats = [
    { label: "Total", value: total },
    { label: "Completed", value: completed },
    { label: "Pending", value: pending },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-brand-deep/10 border border-brand-primary/20 rounded-xl p-4 text-center"
        >
          <p className="font-accent text-3xl font-bold text-brand-cta leading-none mb-1">
            {s.value}
          </p>
          <p className="font-body text-xs text-white/60 uppercase tracking-wide">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
