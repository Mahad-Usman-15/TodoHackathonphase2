"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth_context";
import { api } from "@/lib/api";
import type { Task } from "@/types";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import DeleteConfirmDialog from "@/components/tasks/DeleteConfirmDialog";
import Toast from "@/components/ui/Toast";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth guard — preserved from Phase 1
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch tasks after auth resolves
  useEffect(() => {
    if (!user || isLoading) return;

    setIsLoadingTasks(true);
    api
      .getTasks(user.id)
      .then((fetchedTasks) => {
        setTasks(fetchedTasks);
      })
      .catch((err) => {
        setToast({
          message: err instanceof Error ? err.message : "Failed to load tasks",
          type: "error",
        });
      })
      .finally(() => {
        setIsLoadingTasks(false);
      });
  }, [user, isLoading]);

  // US1 — task created
  const handleTaskCreated = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
    setToast({ message: "Task created successfully", type: "success" });
  }, []);

  // US2 — edit
  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleSave = useCallback((updated: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    setEditingTask(null);
    setToast({ message: "Task updated successfully", type: "success" });
  }, []);

  // US3 — toggle
  const handleToggle = useCallback(
    async (task: Task) => {
      if (!user) return;
      try {
        const updated = await api.toggleTask(user.id, task.id);
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } catch (err) {
        setToast({
          message:
            err instanceof Error ? err.message : "Failed to update task",
          type: "error",
        });
      }
    },
    [user]
  );

  // US4 — delete
  const handleDelete = useCallback((task: Task) => {
    setDeletingTask(task);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!user || !deletingTask) return;
    setIsDeleting(true);
    try {
      await api.deleteTask(user.id, deletingTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      setToast({ message: "Task deleted successfully", type: "success" });
      setDeletingTask(null);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to delete task",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [user, deletingTask]);

  const handleDeleteCancel = useCallback(() => {
    setDeletingTask(null);
  }, []);

  // Loading state (auth resolving)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Todo App</h1>
          <button
            onClick={logout}
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.username}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            You are successfully authenticated.
          </p>
        </div>

        <div className="rounded-lg bg-white border border-gray-200 p-6 shadow-sm mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Account Details
          </h3>
          <dl className="space-y-3">
            <div className="flex items-center gap-4">
              <dt className="w-24 text-sm font-medium text-gray-500">
                Username
              </dt>
              <dd className="text-sm text-gray-900">{user.username}</dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="w-24 text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{user.email}</dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="w-24 text-sm font-medium text-gray-500">
                User ID
              </dt>
              <dd className="text-sm text-gray-900">#{user.id}</dd>
            </div>
          </dl>
        </div>

        {/* Task creation form */}
        <div className="mb-4">
          <TaskForm
            userId={user.id}
            onTaskCreated={handleTaskCreated}
            onError={(message) => setToast({ message, type: "error" })}
          />
        </div>

        {/* Task list */}
        <div className="mt-4">
          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              userId={user.id}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {/* Edit modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          userId={user.id}
          onSave={handleSave}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Delete confirmation dialog */}
      {deletingTask && (
        <DeleteConfirmDialog
          taskTitle={deletingTask.title}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
