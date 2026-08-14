import { db } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Job listing sitemap — canonical URLs only:
 * https://muqabaleh.com/companies/{company-slug}/{job-slug}
 * Never emit /jobs/{id} or /jobs/{slug}.
 */
export async function GET() {
  const urls: Array<{ loc: string; lastmod: string }> = [];

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
        company: { select: { slug: true } },
      },
      orderBy: { postedAt: 'desc' },
      take: 40_000,
    });

    for (const job of jobs) {
      const companySlug = job.company?.slug?.trim();
      const jobSlug = job.slug?.trim();
      if (!companySlug || !jobSlug) continue;
      const lastmod = (job.updatedAt || job.postedAt).toISOString().slice(0, 10);
      for (const prefix of ['', '/en'] as const) {
        urls.push({
          loc: `${SITE_URL}${prefix}/companies/${companySlug}/${jobSlug}`,
          lastmod,
        });
      }
    }
  } catch (err) {
    console.error('[sitemap-jobs]', err);
  }

  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
