import Link from "next/link";

export function CommerceState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="px-6 py-24 text-center" role="status">
      <h1 className="text-4xl [font-family:var(--serif)]">{title}</h1>
      <p className="text-[var(--muted)]">{message}</p>
      <Link
        className="inline-block border border-[#343731] px-6 py-3 text-xs"
        href="/"
      >
        BACK TO HOME
      </Link>
    </section>
  );
}
