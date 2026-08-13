import { getAllPosts, getAllSlugs } from '@/content/blog';
import { db } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';

const JOBS_PER_SITEMAP = 50_000;

export const STATIC_ROUTES = [
  '',
  '/jobs',
  '/employers',
  '/blog',
  '/pricing',
  '/about',
  '/support',
  '/terms',
  '/privacy',
  '/refund',
  '/demo',
  '/business',
  '/request-demo',
  '/interviewers',
  '/human-interviews',
  '/join-as-interviewer',
  '/partners',
  '/verify',
  '/legal/opt-out',
] as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function urlSetXml(
  entries: Array<{
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: number;
  }>,
): string {
  const body = entries
    .map((e) => {
      const parts = [`    <loc>${escapeXml(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (typeof e.priority === 'number') {
        parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function sitemapIndexXml(locs: string[]): string {
  const body = locs
    .map(
      (loc) =>
        `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n  </sitemap>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export function buildStaticEntries() {
  const now = new Date().toISOString();
  const entries: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: number;
  }> = [];

  for (const route of STATIC_ROUTES) {
    const priority =
      route === ''
        ? 1
        : route === '/jobs' || route === '/blog' || route === '/employers' || route === '/pricing'
          ? 0.95
          : route === '/legal/opt-out'
            ? 0.3
            : 0.7;
    const changefreq =
      route === '' || route === '/jobs' || route === '/blog' || route === '/employers'
        ? 'daily'
        : 'monthly';

    entries.push({
      loc: `${SITE_URL}${route || '/'}`,
      lastmod: now,
      changefreq,
      priority,
    });
    entries.push({
      loc: `${SITE_URL}/en${route}`,
      lastmod: now,
      changefreq,
      priority: Math.max(0.5, priority - 0.1),
    });
  }

  return entries;
}

export function buildBlogEntries() {
  const now = new Date().toISOString();
  const postsBySlug = new Map<string, string>();
  for (const post of [...getAllPosts('en'), ...getAllPosts('ar')]) {
    if (!postsBySlug.has(post.slug) || post.date > (postsBySlug.get(post.slug) || '')) {
      postsBySlug.set(post.slug, post.date);
    }
  }

  return getAllSlugs().map(({ locale, slug }) => {
    const prefix = locale === 'en' ? '/en' : '';
    return {
      loc: `${SITE_URL}${prefix}/blog/${slug}`,
      lastmod: postsBySlug.get(slug) || now,
      changefreq: 'monthly',
      priority: 0.7,
    };
  });
}

export async function loadActiveCompaniesAndJobs() {
  try {
    const companies = await db.listedCompany.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        jobs: {
          where: { isActive: true },
          select: { slug: true, updatedAt: true, postedAt: true },
          orderBy: { postedAt: 'desc' },
        },
      },
    });
    return companies;
  } catch (err) {
    console.error('[sitemap] listed companies/jobs', err);
    return [];
  }
}

export function buildCompanyEntries(
  companies: Awaited<ReturnType<typeof loadActiveCompaniesAndJobs>>,
) {
  const entries: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: number;
  }> = [];

  for (const company of companies) {
    for (const prefix of ['', '/en'] as const) {
      entries.push({
        loc: `${SITE_URL}${prefix}/companies/${company.slug}`,
        lastmod: company.updatedAt.toISOString(),
        changefreq: 'daily',
        priority: 0.8,
      });
    }
  }
  return entries;
}

export function buildJobEntries(
  companies: Awaited<ReturnType<typeof loadActiveCompaniesAndJobs>>,
) {
  const entries: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: number;
  }> = [];

  for (const company of companies) {
    for (const job of company.jobs) {
      for (const prefix of ['', '/en'] as const) {
        entries.push({
          loc: `${SITE_URL}${prefix}/companies/${company.slug}/${job.slug}`,
          lastmod: (job.updatedAt || job.postedAt).toISOString(),
          changefreq: 'daily',
          priority: 0.75,
        });
      }
    }
  }
  return entries;
}

/** Child sitemap URLs for the index. Jobs file is capped at 50k URLs. */
export async function sitemapIndexLocs(): Promise<string[]> {
  return [
    `${SITE_URL}/sitemap-static.xml`,
    `${SITE_URL}/sitemap-blog.xml`,
    `${SITE_URL}/sitemap-companies.xml`,
    `${SITE_URL}/sitemap-jobs.xml`,
  ];
}

export { JOBS_PER_SITEMAP };
