import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATHS = ['/b2b', '/interviewer', '/app'];
const SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'muqabaleh_session',
];

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

function getLocaleFromPath(pathname: string): string {
  if (pathname.startsWith('/en')) return 'en';
  return 'ar';
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(ar|en)(\/|$)/, '/');
}

function isProtectedPath(pathname: string): boolean {
  const bare = stripLocale(pathname);
  return PROTECTED_PATHS.some((p) => bare === p || bare.startsWith(p + '/'));
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check auth for ALL protected paths — with or without locale prefix.
  // This must happen BEFORE intlMiddleware rewrites the path internally.
  if (isProtectedPath(pathname) && !hasSession(request)) {
    const locale = getLocaleFromPath(pathname);
    const signinUrl = new URL(`/${locale}/auth/signin`, request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
