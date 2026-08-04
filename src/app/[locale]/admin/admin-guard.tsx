import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/lib/enums';

/**
 * Server-side admin gate. Client-side email checks are bypassable —
 * this runs on the server and redirects non-SUPER_ADMIN users.
 */
export async function AdminGate({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || role !== UserRole.SUPER_ADMIN) {
    redirect(locale === 'ar' ? '/' : `/${locale}`);
  }

  return <>{children}</>;
}
