import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/lib/enums';

/**
 * Server-side SUPER_ADMIN gate.
 * Unauthenticated → sign-in. Authenticated but wrong role → 403 forbidden page.
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

  if (!session?.user) {
    redirect(locale === 'ar' ? '/auth/signin' : `/${locale}/auth/signin`);
  }

  if (role !== UserRole.SUPER_ADMIN) {
    redirect(locale === 'ar' ? '/forbidden' : `/${locale}/forbidden`);
  }

  return <>{children}</>;
}
