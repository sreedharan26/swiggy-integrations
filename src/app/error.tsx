"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
        😕
      </div>
      <h2 className="mt-4 text-xl font-extrabold">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        An unexpected error occurred. Please try again or come back later.
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
