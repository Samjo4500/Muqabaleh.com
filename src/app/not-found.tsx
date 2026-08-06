import Link from 'next/link';

/** Root fallback 404 — crystal atelier (no locale provider here). */
export default function GlobalNotFound() {
  return (
    <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
      </div>
      <p className="text-xs font-bold tracking-[0.2em] text-teal-300/80">404</p>
      <h1 className="mq-display mt-4 text-3xl font-extrabold text-white md:text-5xl">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-md text-white/55">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="mq-btn mq-btn-primary text-sm">
          Go home
        </Link>
        <Link href="/en/verify" className="mq-btn mq-btn-ghost text-sm">
          Verify a passport
        </Link>
      </div>
    </div>
  );
}
