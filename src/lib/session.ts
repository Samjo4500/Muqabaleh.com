import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { ROLES, type Role } from './security';

export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

/**
 * Returns session if valid, or null.
 */
export async function requireAuth() {
  return getSession();
}

/**
 * Returns session if user has one of the allowed roles.
 * Returns null if unauthenticated.
 * Throws redirect to /forbidden if authenticated but wrong role.
 */
export async function requireRole(
  locale: string,
  ...roles: Role[]
) {
  const session = await getSession();
  if (!session) return null;
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (!roles.includes(userRole as Role)) {
    redirect(`/${locale}/forbidden`);
  }
  return session;
}

/**
 * For API routes: returns { session, userId, role } or throws 401.
 */
export async function requireApiAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new ApiError(401, 'Unauthorized');
  }
  return {
    session,
    userId: (session.user as Record<string, unknown>).id as string,
    role: (session.user as Record<string, unknown>).role as Role,
  };
}

/**
 * For API routes: like requireApiAuth but also checks role.
 * Throws 403 if wrong role.
 */
export async function requireApiRole(...roles: Role[]) {
  const auth = await requireApiAuth();
  if (!roles.includes(auth.role)) {
    throw new ApiError(403, 'Forbidden');
  }
  return auth;
}

/** Custom error class for API routes */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
      super(message);
      this.name = 'ApiError';
    }
}

/** All valid roles for type checking */
export const ALL_ROLES = Object.values(ROLES) as string[];
