export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-outline-variant/30 rounded-lg" />
          <div className="h-4 w-28 bg-outline-variant/20 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-outline-variant/20 rounded-xl" />
          <div className="h-10 w-32 bg-outline-variant/30 rounded-xl" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="bg-surface-container h-12 border-b border-outline-variant/40" />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-3.5 border-t border-outline-variant/20"
          >
            <div className="h-4 w-36 bg-outline-variant/30 rounded" />
            {Array.from({ length: cols - 1 }).map((_, j) => (
              <div
                key={j}
                className={`h-4 bg-outline-variant/20 rounded flex-1 ${j === cols - 2 ? 'max-w-[80px]' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
