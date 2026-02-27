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
      className={`rounded-lg border p-4 transition-colors ${
        task.completed
          ? "border-gray-100 bg-gray-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle completion button */}
        <button
          onClick={() => onToggle(task)}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
            task.completed
              ? "border-green-500 bg-green-500 text-white"
              : "border-gray-300 bg-white hover:border-blue-400"
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
            className={`text-sm font-medium leading-snug ${
              task.completed
                ? "text-gray-400 line-through"
                : "text-gray-900"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p
              className={`mt-1 text-sm ${
                task.completed ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {task.description}
            </p>
          )}
          <p className="mt-1.5 text-xs text-gray-400">
            Created {formatDate(task.created_at)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label="Delete task"
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
