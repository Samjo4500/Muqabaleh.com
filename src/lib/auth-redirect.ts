import { localePath } from '@/i18n/navigation';
import { B2B_CONSOLE_PREVIEW } from '@/lib/b2b-preview';

const SAFE_INTERNAL = /^\/[A-Za-z0-9/_?&=.%~+-]*$/;

/** Strip locale prefix so we can re-apply with localePath. */
function barePath(path: string): string {
  if (path.startsWith('/en/') || path === '/en') {
    return path === '/en' ? '/' : path.slice(3);
  }
  return path || '/';
}

/** Reject open redirects; allow only same-site relative paths. */
export function sanitizeCallbackUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim();
  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      const u = new URL(value);
      value = `${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    return null;
  }
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  if (!SAFE_INTERNAL.test(value.split('#')[0] || '/')) return null;
  return value;
}

/**
 * Default landing after auth by role.
 * Company console stays on request-demo while preview-locked.
 */
export function defaultHomeForRole(role: string | undefined | null): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'INTERVIEWER':
      return '/interviewer';
    case 'COMPANY_ADMIN':
      return B2B_CONSOLE_PREVIEW ? '/request-demo?from=signin' : '/b2b';
    case 'PARTNER_ADMIN':
    case 'PARTNER_MEMBER':
      return '/partner';
    case 'USER':
    default:
      return '/app';
  }
}

/**
 * Resolve post-login destination: prefer safe callbackUrl, else role home.
 * Always returns a locale-prefixed path (ar unprefixed).
 */
export function resolvePostAuthPath(opts: {
  locale: string;
  role?: string | null;
  callbackUrl?: string | null;
}): string {
  const safe = sanitizeCallbackUrl(opts.callbackUrl);
  if (safe) {
    return localePath(barePath(safe), opts.locale);
  }
  return localePath(defaultHomeForRole(opts.role), opts.locale);
}
