import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || role !== 'SUPER_ADMIN') {
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
