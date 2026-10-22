'use client'

import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="material-symbols-outlined text-5xl text-error/60 mb-4">error</span>
      <h2 className="font-headline text-xl font-extrabold text-on-surface">Something went wrong</h2>
      <p className="text-on-surface-variant text-sm mt-2 max-w-sm">{error.message}</p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={reset}
          className="px-4 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2.5 border border-outline-variant/60 text-on-surface-variant font-bold rounded-xl text-sm hover:bg-surface-container transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
