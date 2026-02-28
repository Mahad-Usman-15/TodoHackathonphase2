export default function EmptyState() {
  return (
    <div className="py-16 flex flex-col items-center gap-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 text-brand-primary/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
      <h3 className="font-heading text-white/60 text-lg">No tasks yet</h3>
      <p className="font-body text-white/40 text-sm text-center max-w-xs">
        Add your first task above to get started.
      </p>
    </div>
  );
}
