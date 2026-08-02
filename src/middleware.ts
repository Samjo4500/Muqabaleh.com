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
  if (pathname.startsWith('/ar')) return 'ar';
  return 'ar';
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check auth after locale prefix is present
  const hasLocale = /^\/(ar|en)\//.test(pathname) || /^\/(ar|en)$/.test(pathname);

  if (hasLocale) {
    const pathWithoutLocale = pathname.replace(/^\/(ar|en)(\/|$)/, '/');
    const isProtected = PROTECTED_PATHS.some((p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/'));

    if (isProtected && !hasSession(request)) {
      const locale = getLocaleFromPath(pathname);
      const signinUrl = new URL(`/${locale}/auth/signin`, request.url);
      signinUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signinUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
