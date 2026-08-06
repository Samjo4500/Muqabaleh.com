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

/** Role allow-lists mirrored from middleware (edge-safe strings). */
const CALLBACK_ROUTE_ROLES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/app', roles: ['USER', 'SUPER_ADMIN'] },
  { prefix: '/interviewer', roles: ['INTERVIEWER', 'SUPER_ADMIN'] },
  { prefix: '/partner', roles: ['PARTNER_ADMIN', 'PARTNER_MEMBER', 'SUPER_ADMIN'] },
  { prefix: '/admin', roles: ['SUPER_ADMIN'] },
];

function roleCanAccessPath(role: string | undefined | null, path: string): boolean {
  const bare = barePath(path).split('?')[0] || '/';
  // Public interviewer apply/login
  if (bare === '/interviewer/apply' || bare.startsWith('/interviewer/apply/')) return true;
  if (bare === '/interviewer/login' || bare.startsWith('/interviewer/login/')) return true;
  if (bare === '/partners' || bare.startsWith('/partners/')) return true;

  for (const rule of CALLBACK_ROUTE_ROLES) {
    if (bare === rule.prefix || bare.startsWith(`${rule.prefix}/`)) {
      return Boolean(role && rule.roles.includes(role));
    }
  }
  return true;
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
  if (safe && roleCanAccessPath(opts.role, safe)) {
    return localePath(barePath(safe), opts.locale);
  }
  return localePath(defaultHomeForRole(opts.role), opts.locale);
}
