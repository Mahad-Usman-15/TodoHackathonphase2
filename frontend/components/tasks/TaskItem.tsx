"use client";

import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskItem({ task, onEdit, onToggle, onDelete }: TaskItemProps) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        task.completed
          ? "opacity-50 border-brand-primary/10 bg-brand-deep/10 hover:opacity-60"
          : "border-brand-primary/20 bg-brand-deep/10 hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-deep/20 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle completion button */}
        <button
          onClick={() => onToggle(task)}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-cta focus:ring-offset-1 focus:ring-offset-brand-bg active:scale-90 ${
            task.completed
              ? "border-brand-cta bg-brand-cta text-white"
              : "border-brand-primary/40 bg-transparent hover:border-brand-cta"
          }`}
        >
          {task.completed && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Task content */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium leading-snug font-body ${
              task.completed
                ? "text-white/40 line-through"
                : "text-white"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 text-sm font-body text-white/60">
              {task.description}
            </p>
          )}
          <p className="mt-1.5 text-xs font-accent text-white/30">
            Created {formatDate(task.created_at)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="rounded-md px-2.5 py-1.5 text-xs font-body text-white/50 hover:text-white hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-cta focus:ring-offset-1 focus:ring-offset-brand-bg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label="Delete task"
            className="rounded-md px-2.5 py-1.5 text-xs font-body text-brand-cta/60 hover:text-brand-cta hover:bg-brand-cta/10 focus:outline-none focus:ring-2 focus:ring-brand-cta focus:ring-offset-1 focus:ring-offset-brand-bg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
