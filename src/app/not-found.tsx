import Link from 'next/link';

/** Root fallback 404 — crystal atelier (no locale provider here). */
export default function GlobalNotFound() {
  return (
    <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
      </div>
      <p className="mq-display text-7xl font-extrabold tracking-tight text-teal-300/90 md:text-8xl">
        404
      </p>
      <h1 className="mq-display mt-4 text-3xl font-extrabold text-white md:text-5xl">
        هذه الصفحة غير موجودة / Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-md text-white/55">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="mq-btn mq-btn-primary min-h-12 text-sm">
          العودة للرئيسية / Go Home
        </Link>
      </div>
    </div>
  );
}
