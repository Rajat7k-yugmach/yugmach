"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink-muted">Please try again, or go back to the catalogue.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded bg-amber px-5 py-3 text-sm font-semibold text-amber-ink"
        >
          Try again
        </button>
        <Link href="/products" className="rounded border border-border px-5 py-3 text-sm font-medium text-ink">
          Browse machines
        </Link>
      </div>
    </main>
  );
}
