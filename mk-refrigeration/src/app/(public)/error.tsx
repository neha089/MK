'use client'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-margin-desktop">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">error_outline</span>
      <h2 className="font-headline text-xl font-extrabold text-on-surface">Something went wrong</h2>
      <p className="text-on-surface-variant text-sm mt-2">We could not load this page. Please try again.</p>
      <button
        onClick={reset}
        className="mt-6 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
