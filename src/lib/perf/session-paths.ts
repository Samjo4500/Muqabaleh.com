/** Paths that need next-auth SessionProvider. Marketing pages skip it to cut TBT. */

export function barePathname(pathname: string): string {
  return pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
}

export function pathNeedsSession(pathname: string): boolean {
  const bare = barePathname(pathname);
  if (bare === '/interviewers' || bare.startsWith('/interviewers/')) return false;
  if (bare === '/interview-guide' || bare.startsWith('/interview-guide/')) return false;
  if (bare === '/partners' || bare.startsWith('/partners/')) return false;

  const prefixes = [
    '/app',
    '/admin',
    '/auth',
    '/pricing',
    '/apply',
    '/interview',
    '/interviewer',
    '/b2b',
    '/console',
    '/partner',
    '/portal',
    '/call',
    '/book',
    '/booking',
    '/passport',
  ];
  return prefixes.some((p) => bare === p || bare.startsWith(`${p}/`));
}
