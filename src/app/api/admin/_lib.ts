import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/lib/enums';

export async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || role !== UserRole.SUPER_ADMIN) {
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
