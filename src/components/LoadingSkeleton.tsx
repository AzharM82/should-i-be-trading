export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-t-bg p-3 space-y-3">
      {/* Top bar skeleton */}
      <div className="skeleton h-10 w-full rounded" />

      {/* Hero + Summary row */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4 skeleton h-64 rounded" />
        <div className="col-span-8 skeleton h-64 rounded" />
      </div>

      {/* Category panels */}
      <div className="grid grid-cols-4 gap-3">
        <div className="skeleton h-48 rounded" />
        <div className="skeleton h-48 rounded" />
        <div className="skeleton h-48 rounded" />
        <div className="skeleton h-48 rounded" />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 skeleton h-52 rounded" />
        <div className="col-span-3 skeleton h-52 rounded" />
        <div className="col-span-3 skeleton h-52 rounded" />
      </div>

      {/* Scoring breakdown */}
      <div className="skeleton h-36 w-full rounded" />
    </div>
  );
}
