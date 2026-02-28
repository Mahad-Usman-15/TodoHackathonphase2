"use client";

interface DeleteConfirmDialogProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmDialog({
  taskTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-brand-bg/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm bg-brand-deep/20 border border-brand-primary/30 rounded-2xl p-6 backdrop-blur-md shadow-2xl shadow-brand-bg/50">
        <h2 className="font-heading font-semibold text-white text-base mb-2">
          Delete Task
        </h2>
        <p className="font-body text-sm text-white/70 mb-6">
          Are you sure you want to delete &quot;{taskTitle}&quot;? This cannot
          be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="font-body text-sm text-white/60 hover:text-white border border-brand-primary/30 hover:border-brand-primary/60 rounded-lg px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="font-heading font-semibold text-sm bg-brand-cta hover:bg-brand-cta-hover text-white rounded-lg px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
