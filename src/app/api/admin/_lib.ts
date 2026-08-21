import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/lib/enums';
import { isSuperAdminEmail } from '@/lib/admin/constants';

export async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const email = session?.user?.email;

  const isAdmin =
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.ADMIN ||
    isSuperAdminEmail(email);
  if (!session?.user || !isAdmin) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    authorized: true as const,
    adminEmail: session.user.email ?? 'admin',
    adminId: (session.user as { id?: string }).id,
  };
}
