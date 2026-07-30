import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void px-4">
      <p className="text-6xl font-extrabold text-gold">404</p>
      <p className="mt-4 text-[var(--text-muted)]">Page not found</p>
      <Link href="/" className="btn-gold mt-8 text-sm">
        Go Home
      </Link>
    </div>
  );
}
