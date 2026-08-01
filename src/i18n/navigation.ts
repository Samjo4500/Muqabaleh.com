// Locale switching helper
// createNavigation from next-intl has a compatibility issue with Next.js 16,
// so we use window.location.href for locale switching instead.

export function getLocaleSwitchPath(currentPathname: string, currentLocale: string, nextLocale: string): string {
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
  
  // For default locale (ar), no prefix needed
  if (nextLocale === 'ar') {
    return path || '/';
  }
  // For non-default locale, add prefix
  return `/${nextLocale}${path || '/'}`;
}