"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="px-6 py-24 text-center" role="alert">
      <h1 className="text-4xl [font-family:var(--serif)]">
        The collection is temporarily unavailable.
      </h1>
      <p className="text-[var(--muted)]">Please try again in a moment.</p>
      <button
        className="border border-[#343731] px-6 py-3 text-xs"
        onClick={reset}
      >
        TRY AGAIN
      </button>
    </section>
  );
}
