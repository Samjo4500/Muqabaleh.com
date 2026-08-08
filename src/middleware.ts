import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Edge-safe role strings — do NOT import Prisma enums here.
 * `@prisma/client` is Node-only; on Edge those enum values become undefined
 * and every authenticated user gets redirected to /forbidden.
 */
const ROLE = {
  USER: 'USER',
  INTERVIEWER: 'INTERVIEWER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  PARTNER_ADMIN: 'PARTNER_ADMIN',
  PARTNER_MEMBER: 'PARTNER_MEMBER',
} as const;

// ─── Route → allowed roles ─────────────────────────────────────
const ROUTE_ROLES: Record<string, string[]> = {
  '/app': [ROLE.USER, ROLE.SUPER_ADMIN],
  '/interviewer': [ROLE.INTERVIEWER, ROLE.SUPER_ADMIN],
  // /b2b is a public preview console — writes stay locked in app/API layer
  '/partner': [ROLE.PARTNER_ADMIN, ROLE.PARTNER_MEMBER, ROLE.SUPER_ADMIN],
  '/admin': [ROLE.SUPER_ADMIN],
  // Gated AI mock interview engine — any authenticated role with email session
  '/interview/prequal': [
    ROLE.USER,
    ROLE.INTERVIEWER,
    ROLE.COMPANY_ADMIN,
    ROLE.PARTNER_ADMIN,
    ROLE.PARTNER_MEMBER,
    ROLE.SUPER_ADMIN,
  ],
  '/interview/prep': [
    ROLE.USER,
    ROLE.INTERVIEWER,
    ROLE.COMPANY_ADMIN,
    ROLE.PARTNER_ADMIN,
    ROLE.PARTNER_MEMBER,
    ROLE.SUPER_ADMIN,
  ],
  '/interview/summary': [
    ROLE.USER,
    ROLE.INTERVIEWER,
    ROLE.COMPANY_ADMIN,
    ROLE.PARTNER_ADMIN,
    ROLE.PARTNER_MEMBER,
    ROLE.SUPER_ADMIN,
  ],
  '/interview/session': [
    ROLE.USER,
    ROLE.INTERVIEWER,
    ROLE.COMPANY_ADMIN,
    ROLE.PARTNER_ADMIN,
    ROLE.PARTNER_MEMBER,
    ROLE.SUPER_ADMIN,
  ],
  '/interview/report': [
    ROLE.USER,
    ROLE.INTERVIEWER,
    ROLE.COMPANY_ADMIN,
    ROLE.PARTNER_ADMIN,
    ROLE.PARTNER_MEMBER,
    ROLE.SUPER_ADMIN,
  ],
};

/** Public interviewer paths that do not require INTERVIEWER role */
const INTERVIEWER_PUBLIC_SUFFIXES = ['/apply', '/login'];

/** Public partner marketing/apply (console lives under /partner) */
const PARTNER_PUBLIC_PREFIXES = ['/partners'];

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
  // Public partner marketing pages
  if (PARTNER_PUBLIC_PREFIXES.some((p) => bare === p || bare.startsWith(`${p}/`))) {
    return null;
  }
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
      return (fallback.role as string) || ROLE.USER;
    }

    return (token.role as string) || ROLE.USER;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  // Resolve white-label partner from host (custom domain / subdomain)
  const host = request.headers.get('host') || '';
  if (host && !host.includes('localhost') && !host.includes('muqabaleh.com')) {
    requestHeaders.set('x-partner-host', host.split(':')[0]);
  }

  // Protect admin APIs explicitly (matcher includes /api/admin)
  if (pathname.startsWith('/api/admin')) {
    const role = await getRoleFromRequest(request);
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (role !== ROLE.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Partner APIs — require partner roles (handlers also verify)
  if (
    pathname.startsWith('/api/partner') &&
    !pathname.startsWith('/api/partner/apply') &&
    !pathname.startsWith('/api/partner/resolve')
  ) {
    const role = await getRoleFromRequest(request);
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const partnerRoles: string[] = [ROLE.PARTNER_ADMIN, ROLE.PARTNER_MEMBER, ROLE.SUPER_ADMIN];
    if (!partnerRoles.includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Check if this is a protected page route
  const protectedRoute = getProtectedRoute(pathname);

  if (protectedRoute) {
    const role = await getRoleFromRequest(request);
    const locale = getLocaleFromPath(pathname);

    // No valid session → redirect to register for interview engine (capture email), else signin
    if (!role) {
      const bare = stripLocale(pathname);
      const preferRegister =
        bare.startsWith('/interview/prequal') ||
        bare.startsWith('/interview/summary') ||
        bare.startsWith('/interview/session') ||
        bare.startsWith('/interview/report');
      const authPath = preferRegister ? '/auth/register' : '/auth/signin';
      const authUrl = new URL(
        locale === 'ar' ? authPath : `/${locale}${authPath}`,
        request.url,
      );
      authUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(authUrl);
    }

    // Valid session but wrong role → redirect to forbidden
    if (!protectedRoute.roles.includes(role)) {
      const forbiddenUrl = new URL(
        locale === 'ar' ? '/forbidden' : `/${locale}/forbidden`,
        request.url,
      );
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  const res = intlMiddleware(request);
  // Preserve partner host header through intl rewrite when possible
  if (requestHeaders.get('x-partner-host')) {
    res.headers.set('x-partner-host', requestHeaders.get('x-partner-host')!);
  }
  return res;
}

export const config = {
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/api/admin/:path*',
    '/api/partner/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
