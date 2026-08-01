// Locale switching helper
// createNavigation from next-intl has a compatibility issue with Next.js 16,
// so we use window.location.href for locale switching instead.

export function getLocaleSwitchPath(currentPathname: string, currentLocale: string, nextLocale: string): string {
  // Preserve hash (e.g. #pricing) and search params
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const search = typeof window !== 'undefined' ? window.location.search : '';

  // Remove any existing locale prefix from the pathname
  let path = currentPathname;
  const locales = ['ar', 'en'];
  for (const loc of locales) {
    if (path === `/${loc}`) {
      path = '/';
      break;
    }
    if (path.startsWith(`/${loc}/`)) {
      path = path.slice(`/${loc}`.length);
      break;
    }
  }

  // Normalize: remove trailing slash (except root)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // For default locale (ar), no prefix needed
  if (nextLocale === 'ar') {
    return `${path || '/'}${search}${hash}`;
  }
  // For non-default locale, add prefix (no double slash)
  const basePath = path === '/' ? '' : path;
  return `/${nextLocale}${basePath}${search}${hash}`;
}