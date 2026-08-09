import { redirect } from 'next/navigation';

/**
 * Fallback when middleware does not rewrite bare `/`.
 * Prefer next-intl middleware (as-needed → Arabic at `/`).
 * Explicit `/ar` is a last resort — never redirect to `/` (loop).
 */
export default function RootPage() {
  redirect('/ar');
}
