"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <h1 className="font-display text-2xl">Something went wrong</h1>
      <p className="text-[var(--muted)] max-w-md text-[13px]">
        An unexpected error occurred while loading this page. This is usually
        temporary — try again in a moment.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--accent)] px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Retry
      </button>
    </div>
  );
}
