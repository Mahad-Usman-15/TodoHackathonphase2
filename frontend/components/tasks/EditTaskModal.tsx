"use client";

import { useState, FormEvent, useEffect } from "react";
import { api } from "@/lib/api";
import type { Task } from "@/types";

interface EditTaskModalProps {
  task: Task;
  userId: number;
  onSave: (updated: Task) => void;
  onClose: () => void;
}

export default function EditTaskModal({
  task,
  userId,
  onSave,
  onClose,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync form if task prop changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setError(null);
  }, [task]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await api.updateTask(userId, task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onSave(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-brand-bg/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-brand-deep/20 border border-brand-primary/30 rounded-2xl p-6 backdrop-blur-md shadow-2xl shadow-brand-bg/50">
        <h2 className="font-heading font-semibold text-white text-base mb-4">
          Edit Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="edit-task-title"
              className="block font-body text-sm text-white/70 mb-1"
            >
              Title <span className="text-brand-cta">*</span>
            </label>
            <input
              id="edit-task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              disabled={isSaving}
              className="w-full rounded-lg bg-brand-bg border border-brand-primary/30 px-3 py-2 font-body text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-cta focus:ring-1 focus:ring-brand-cta disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="edit-task-description"
              className="block font-body text-sm text-white/70 mb-1"
            >
              Description
            </label>
            <textarea
              id="edit-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              disabled={isSaving}
              className="w-full resize-none rounded-lg bg-brand-bg border border-brand-primary/30 px-3 py-2 font-body text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-cta focus:ring-1 focus:ring-brand-cta disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
          </div>

          {error && (
            <p className="font-body text-sm text-brand-cta/80">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="font-body text-sm text-white/60 hover:text-white border border-brand-primary/30 hover:border-brand-primary/60 rounded-lg px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="font-heading font-semibold text-sm bg-brand-cta hover:bg-brand-cta-hover text-white rounded-lg px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
