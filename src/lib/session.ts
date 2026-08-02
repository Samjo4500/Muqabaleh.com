import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

/**
 * Returns the session if valid, or null.
 * Does NOT throw — callers must check the return value.
 */
export async function requireAuth() {
  return getSession();
}

export async function requireRole(...roles: string[]) {
  const session = await requireAuth();
  if (!session) return null;
  if (!roles.includes(session.user.role)) return null;
  return session;
}
