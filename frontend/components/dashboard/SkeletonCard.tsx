export default function SkeletonCard() {
  return (
    <div className="bg-brand-deep/10 border border-brand-primary/10 rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded bg-brand-primary/20" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-brand-primary/20 rounded w-3/4" />
          <div className="h-3 bg-brand-primary/10 rounded w-1/2" />
          <div className="h-3 bg-brand-primary/10 rounded w-1/4 mt-1" />
        </div>
      </div>
    </div>
  );
}
