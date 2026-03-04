"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth_context";
import { api } from "@/lib/api";
import type { Task } from "@/types";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import DeleteConfirmDialog from "@/components/tasks/DeleteConfirmDialog";
import Toast from "@/components/ui/Toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsBar from "@/components/dashboard/StatsBar";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

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
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "completed">("all");
  const taskListRef = useRef<HTMLDivElement>(null);

  // Auth guard — preserved from Phase 1
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const loadTasks = useCallback(() => {
    if (!user) return;
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
  }, [user]);

  // T026: pull-to-refresh on mobile (after loadTasks is defined)
  const { isPulling } = usePullToRefresh(loadTasks, taskListRef);

  // Fetch tasks after auth resolves
  useEffect(() => {
    if (!user || isLoading) return;
    loadTasks();
  }, [user, isLoading, loadTasks]);

  // US2 — refetch tasks when user returns to this page from chat
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && user) {
        loadTasks();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadTasks, user]);

  const handleTaskCreated = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
    setToast({ message: "Task created ✓", type: "success" });
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleSave = useCallback((updated: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    setEditingTask(null);
    setToast({ message: "Task updated ✓", type: "success" });
  }, []);

  const handleToggle = useCallback(
    async (task: Task) => {
      if (!user) return;
      try {
        const updated = await api.toggleTask(user.id, task.id);
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        setToast({
          message: updated.completed ? "Task marked complete ✓" : "Task unmarked ✓",
          type: "success",
        });
      } catch (err) {
        setToast({
          message: err instanceof Error ? err.message : "Action failed — please try again",
          type: "error",
        });
      }
    },
    [user]
  );

  const handleDelete = useCallback((task: Task) => {
    setDeletingTask(task);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!user || !deletingTask) return;
    setIsDeleting(true);
    try {
      await api.deleteTask(user.id, deletingTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      setToast({ message: "Task deleted ✓", type: "success" });
      setDeletingTask(null);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Action failed — please try again",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [user, deletingTask]);

  const handleDeleteCancel = useCallback(() => {
    setDeletingTask(null);
  }, []);

  if (isLoading || !user) {
    return null;
  }

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "completed") return t.completed;
    return !t.completed;
  });

  return (
    <div className="min-h-screen bg-brand-bg">
      <DashboardHeader username={user.username} onLogout={logout} />

      <main className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:pb-8">
        <StatsBar tasks={tasks} />

        {/* Task creation form */}
        <div className="mb-4">
          <TaskForm
            userId={user.id}
            onTaskCreated={handleTaskCreated}
            onError={(message) => setToast({ message, type: "error" })}
          />
        </div>

        {/* Filter tabs */}
        <div className="mt-6 flex gap-1 border-b border-brand-primary/20">
          {(["all", "pending", "completed"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              aria-label={`Show ${filter} tasks`}
              className={`px-4 py-2 text-sm font-body capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg ${
                activeFilter === filter
                  ? "border-b-2 border-brand-cta text-brand-cta"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Task list with pull-to-refresh and error boundary */}
        <div className="mt-4" ref={taskListRef}>
          {isPulling && (
            <div className="flex justify-center py-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
            </div>
          )}
          <ErrorBoundary>
            {isLoadingTasks ? (
              <div className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h3 className="font-heading text-white/50 text-base">
                  {activeFilter === "all" && "No tasks yet — create your first one!"}
                  {activeFilter === "pending" && "All caught up! No pending tasks."}
                  {activeFilter === "completed" && "No completed tasks yet — mark one done!"}
                </h3>
              </div>
            ) : (
              <TaskList
                tasks={filteredTasks}
                userId={user.id}
                onEdit={handleEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            )}
          </ErrorBoundary>
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
