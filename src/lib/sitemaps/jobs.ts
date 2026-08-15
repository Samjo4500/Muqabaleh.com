import { db } from '@/lib/db';
import { urlsetXml } from './xml';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

export async function buildJobsSitemapXml(): Promise<{ xml: string; urls: number }> {
  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> =
    [];
  const seenCompanies = new Set<string>();

  try {
    const jobs = await db.listedJob.findMany({
      where: {
        isActive: true,
        company: { isActive: true, slug: { not: '' } },
        slug: { not: '' },
      },
      select: {
        slug: true,
        updatedAt: true,
        postedAt: true,
        company: { select: { slug: true, updatedAt: true } },
      },
      orderBy: { postedAt: 'desc' },
      take: 40_000,
    });

    for (const job of jobs) {
      const companySlug = job.company?.slug?.trim();
      const jobSlug = job.slug?.trim();
      if (!companySlug || !jobSlug) continue;
      const lastmod = (job.updatedAt || job.postedAt).toISOString().slice(0, 10);
      if (!seenCompanies.has(companySlug)) {
        seenCompanies.add(companySlug);
        const companyLast =
          job.company?.updatedAt?.toISOString().slice(0, 10) || lastmod;
        for (const prefix of ['', '/en'] as const) {
          urls.push({
            loc: `${SITE_URL}${prefix}/companies/${companySlug}`,
            lastmod: companyLast,
            changefreq: 'daily',
            priority: '0.8',
          });
        }
      }
      for (const prefix of ['', '/en'] as const) {
        urls.push({
          loc: `${SITE_URL}${prefix}/companies/${companySlug}/${jobSlug}`,
          lastmod,
          changefreq: 'daily',
          priority: '0.8',
        });
      }
    }
  } catch (err) {
    console.error('[sitemap-jobs]', err);
  }

  return { xml: urlsetXml(urls), urls: urls.length };
}
