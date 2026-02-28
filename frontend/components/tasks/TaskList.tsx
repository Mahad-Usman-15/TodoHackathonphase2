"use client";

import type { Task } from "@/types";
import TaskItem from "./TaskItem";
import EmptyState from "@/components/dashboard/EmptyState";

interface TaskListProps {
  tasks: Task[];
  userId: number;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskList({
  tasks,
  userId: _userId,
  onEdit,
  onToggle,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
