const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

/** Marketing + legal URLs that rarely change — safe to keep in /sitemap.xml. */
export const STATIC_SITEMAP_ROUTES = [
  '',
  '/jobs',
  '/companies',
  '/employers',
  '/business',
  '/request-demo',
  '/demo',
  '/about',
  '/press',
  '/company-profile',
  '/support',
  '/privacy',
  '/terms',
  '/refund',
  '/join-as-interviewer',
  '/interviewers',
  '/human-interviews',
  '/blog',
  '/partners',
  '/verify',
  '/legal/opt-out',
  '/interview-guide',
  '/interview-guide/role',
] as const;

export type StaticSitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency: 'daily' | 'monthly';
  priority: number;
};

export function buildStaticSitemapEntries(
  now = new Date().toISOString(),
): StaticSitemapEntry[] {
  const entries: StaticSitemapEntry[] = [];
  for (const route of STATIC_SITEMAP_ROUTES) {
    const priority =
      route === ''
        ? 1
        : route === '/jobs' ||
            route === '/companies' ||
            route === '/blog' ||
            route === '/employers'
          ? 0.95
          : route === '/demo' || route === '/business'
            ? 0.85
            : route === '/legal/opt-out'
              ? 0.3
              : 0.7;
    const changeFrequency: StaticSitemapEntry['changeFrequency'] =
      route === '' ||
      route === '/jobs' ||
      route === '/companies' ||
      route === '/blog' ||
      route === '/employers'
        ? 'daily'
        : 'monthly';
    entries.push({
      url: `${SITE_URL}${route || '/'}`,
      lastModified: now,
      changeFrequency,
      priority,
    });
    entries.push({
      url: `${SITE_URL}/en${route}`,
      lastModified: now,
      changeFrequency,
      priority: Math.max(0.5, priority - 0.1),
    });
  }
  return entries;
}

export function sitemapIndexLocs(now = new Date().toISOString().slice(0, 10)) {
  return [
    { loc: `${SITE_URL}/sitemap.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-static.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-jobs.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-interview-guides.xml`, lastmod: now },
  ];
}
