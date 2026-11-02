export function StatSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-36 bg-outline-variant/30 rounded-lg" />
        <div className="h-4 w-72 bg-outline-variant/20 rounded" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-outline-variant/40 p-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-outline-variant/30 rounded-xl flex-shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-3 bg-outline-variant/20 rounded w-3/4" />
                <div className="h-6 bg-outline-variant/30 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 p-6">
        <div className="space-y-2 mb-6">
          <div className="h-5 w-32 bg-outline-variant/30 rounded" />
          <div className="h-3 w-48 bg-outline-variant/20 rounded" />
        </div>
        <div className="h-40 bg-outline-variant/10 rounded-xl" />
      </div>
    </div>
  )
}
