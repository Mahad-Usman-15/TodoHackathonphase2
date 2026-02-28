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
      className="bg-brand-deep/10 border border-brand-primary/20 rounded-xl p-6"
    >
      <h2 className="font-accent text-brand-primary text-xs uppercase tracking-widest mb-4">
        New Task
      </h2>
      <div className="space-y-3">
        <div>
          <label
            htmlFor="task-title"
            className="block font-body text-sm text-white/70 mb-1"
          >
            Title <span className="text-brand-cta">*</span>
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
            className="w-full rounded-lg bg-brand-bg border border-brand-primary/30 px-3 py-2 font-body text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-cta focus:ring-1 focus:ring-brand-cta disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="task-description"
            className="block font-body text-sm text-white/70 mb-1"
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
            className="w-full rounded-lg bg-brand-bg border border-brand-primary/30 px-3 py-2 font-body text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-cta focus:ring-1 focus:ring-brand-cta disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="font-heading font-semibold text-sm bg-brand-cta hover:bg-brand-cta-hover text-white rounded-lg px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Task"}
          </button>
        </div>
      </div>
    </form>
  );
}
