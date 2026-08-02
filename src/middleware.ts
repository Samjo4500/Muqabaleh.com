import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { decodeJwt } from 'jose';

const intlMiddleware = createMiddleware(routing);

// ─── Route → allowed roles ─────────────────────────────────────
const ROUTE_ROLES: Record<string, string[]> = {
  '/app': ['USER', 'SUPER_ADMIN'],
  '/interviewer': ['INTERVIEWER', 'SUPER_ADMIN'],
  '/b2b': ['COMPANY_ADMIN', 'SUPER_ADMIN'],
  '/admin': ['SUPER_ADMIN'],
};

const SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

function getLocaleFromPath(pathname: string): string {
  return pathname.startsWith('/en') ? 'en' : 'ar';
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(ar|en)(\/|$)/, '/');
}

function getProtectedRoute(pathname: string): { route: string; roles: string[] } | null {
  const bare = stripLocale(pathname);
  for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
    if (bare === route || bare.startsWith(route + '/')) {
      return { route, roles };
    }
  }
  return null;
}

/**
 * Decode the NextAuth JWT cookie to extract the user's role.
 * Returns null if the cookie doesn't exist or is invalid.
 */
function getRoleFromRequest(request: NextRequest): string | null {
  for (const name of SESSION_COOKIES) {
    const token = request.cookies.get(name)?.value;
    if (!token) continue;
    try {
      const payload = decodeJwt(token);
      return (payload.role as string) || 'USER';
    } catch {
      // Invalid/expired token — treat as no session
      return null;
    }
  }
  return null;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const protectedRoute = getProtectedRoute(pathname);

  if (protectedRoute) {
    const role = getRoleFromRequest(request);
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
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
