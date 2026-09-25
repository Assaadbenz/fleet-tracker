export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4"
          />
        ))}
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-9 w-72 rounded-lg bg-zinc-800/60" />
        <div className="h-9 w-64 rounded-lg bg-zinc-800/60" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
        <div className="h-12 border-b border-zinc-800 bg-zinc-950/60" />
        <div className="divide-y divide-zinc-800/60 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-14 rounded-lg bg-zinc-800/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
