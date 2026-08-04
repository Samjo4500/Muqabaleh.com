import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// ─── Route → allowed roles ─────────────────────────────────────
const ROUTE_ROLES: Record<string, string[]> = {
  '/app': ['USER', 'SUPER_ADMIN'],
  '/interviewer': ['INTERVIEWER', 'SUPER_ADMIN'],
  '/b2b': ['COMPANY_ADMIN', 'SUPER_ADMIN'],
  '/admin': ['SUPER_ADMIN'],
};

/** Public interviewer paths that do not require INTERVIEWER role */
const INTERVIEWER_PUBLIC_SUFFIXES = ['/apply', '/login'];

function getLocaleFromPath(pathname: string): string {
  return pathname.startsWith('/en') ? 'en' : 'ar';
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(ar|en)(\/|$)/, '/');
}

function isInterviewerPublicPath(bare: string): boolean {
  return INTERVIEWER_PUBLIC_SUFFIXES.some(
    (suffix) => bare === `/interviewer${suffix}` || bare.startsWith(`/interviewer${suffix}/`),
  );
}

function getProtectedRoute(pathname: string): { route: string; roles: string[] } | null {
  const bare = stripLocale(pathname);
  for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
    if (bare === route || bare.startsWith(route + '/')) {
      // Only /interviewer/apply and /interviewer/login are public under /interviewer/*
      if (route === '/interviewer' && isInterviewerPublicPath(bare)) {
        return null;
      }
      return { route, roles };
    }
  }
  return null;
}

/**
 * Verify the NextAuth JWT (signature-checked) and return the user's role.
 */
async function getRoleFromRequest(request: NextRequest): Promise<string | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  try {
    const token = await getToken({
      req: request,
      secret,
      // Matches auth.ts cookie name (__Secure- prefix always configured)
      cookieName: '__Secure-next-auth.session-token',
    });

    if (!token) {
      // Fallback for local/dev cookies without __Secure- prefix
      const fallback = await getToken({
        req: request,
        secret,
        cookieName: 'next-auth.session-token',
      });
      if (!fallback) return null;
      return (fallback.role as string) || 'USER';
    }

    return (token.role as string) || 'USER';
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin APIs explicitly (matcher includes /api/admin)
  if (pathname.startsWith('/api/admin')) {
    const role = await getRoleFromRequest(request);
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Check if this is a protected page route
  const protectedRoute = getProtectedRoute(pathname);

  if (protectedRoute) {
    const role = await getRoleFromRequest(request);
    const locale = getLocaleFromPath(pathname);

    // No valid session → redirect to signin
    if (!role) {
      const signinUrl = new URL(`/${locale}/auth/signin`, request.url);
      signinUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signinUrl);
    }

    // Valid session but wrong role → redirect to forbidden
    if (!protectedRoute.roles.includes(role)) {
      const forbiddenUrl = new URL(`/${locale}/forbidden`, request.url);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/api/admin/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
