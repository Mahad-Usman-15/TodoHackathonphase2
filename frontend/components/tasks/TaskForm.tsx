"use client";

import { useState, FormEvent } from "react";
import { api } from "@/lib/api";
import type { Task } from "@/types";

interface TaskFormProps {
  userId: number;
  onTaskCreated: (task: Task) => void;
  onError: (message: string) => void;
}

export default function TaskForm({ userId, onTaskCreated, onError }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const newTask = await api.createTask(userId, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onTaskCreated(newTask);
      setTitle("");
      setDescription("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create task";
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white border border-gray-200 p-6 shadow-sm"
    >
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
        New Task
      </h3>
      <div className="space-y-3">
        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            disabled={isSubmitting}
            placeholder="What needs to be done?"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
        <div>
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={3}
            disabled={isSubmitting}
            placeholder="Add more details (optional)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Task"}
          </button>
        </div>
      </div>
    </form>
  );
}
