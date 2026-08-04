// Locale-aware path helpers.
// createNavigation from next-intl has a compatibility issue with Next.js 16,
// so we use these helpers + next/link instead of next-intl Link.

import { routing } from './routing';

const LOCALES = routing.locales as readonly string[];

function stripLocalePrefix(pathname: string): string {
  for (const loc of LOCALES) {
    if (pathname === `/${loc}`) return '/';
    if (pathname.startsWith(`/${loc}/`)) {
      return pathname.slice(loc.length + 1);
    }
  }
  return pathname || '/';
}

/**
 * Prefix a site-relative href for the active locale.
 * Default locale (ar) stays unprefixed; English becomes `/en/...`.
 * Hash-only (`#pricing`) and absolute/external URLs are left unchanged.
 */
export function localePath(href: string, locale: string): string {
  if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(href)) {
    return href;
  }

  let pathname = href;
  let search = '';
  let hash = '';

  const hashIndex = pathname.indexOf('#');
  if (hashIndex >= 0) {
    hash = pathname.slice(hashIndex);
    pathname = pathname.slice(0, hashIndex);
  }

  const searchIndex = pathname.indexOf('?');
  if (searchIndex >= 0) {
    search = pathname.slice(searchIndex);
    pathname = pathname.slice(0, searchIndex);
  }

  pathname = stripLocalePrefix(pathname || '/');
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  if (locale === routing.defaultLocale) {
    return `${pathname || '/'}${search}${hash}`;
  }

  const basePath = pathname === '/' ? '' : pathname;
  return `/${locale}${basePath}${search}${hash}`;
}

export function getLocaleSwitchPath(currentPathname: string, currentLocale: string, nextLocale: string): string {
  // Preserve hash (e.g. #pricing) and search params
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const search = typeof window !== 'undefined' ? window.location.search : '';

  let path = stripLocalePrefix(currentPathname);

  // Normalize: remove trailing slash (except root)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // For default locale (ar), no prefix needed
  if (nextLocale === routing.defaultLocale) {
    return `${path || '/'}${search}${hash}`;
  }
  // For non-default locale, add prefix (no double slash)
  const basePath = path === '/' ? '' : path;
  return `/${nextLocale}${basePath}${search}${hash}`;
}
