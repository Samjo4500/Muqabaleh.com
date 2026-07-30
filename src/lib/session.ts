import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

export async function requireRole(...roles: string[]) {
  const session = await requireAuth();
  if (!session) return null;
  if (!roles.includes(session.user.role)) return null;
  return session;
}
