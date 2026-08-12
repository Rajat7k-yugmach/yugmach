/**
 * Lightweight in-page skeleton shown via app/loading.tsx during route transitions.
 */
export function PageLoadingSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl animate-pulse px-4 py-8 md:py-10"
      aria-busy="true"
      aria-label="Loading page"
      data-testid="page-loading-skeleton"
    >
      <div className="h-3 w-40 rounded bg-border" />
      <div className="mt-6 h-9 w-3/4 max-w-xl rounded-md bg-border" />
      <div className="mt-3 h-4 w-full max-w-2xl rounded bg-border/70" />
      <div className="mt-2 h-4 w-5/6 max-w-xl rounded bg-border/70" />
      <div className="mt-10 space-y-3 rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="h-4 w-full rounded bg-border/60" />
        <div className="h-4 w-11/12 rounded bg-border/60" />
        <div className="h-4 w-4/5 rounded bg-border/60" />
        <div className="h-4 w-full rounded bg-border/60" />
        <div className="h-4 w-2/3 rounded bg-border/60" />
      </div>
    </div>
  );
}
