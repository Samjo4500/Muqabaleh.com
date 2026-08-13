import {
  listRegistryCompanies,
  listRegistryRoles,
  GUIDE_TEMPLATE_UPDATED_AT,
} from '@/lib/interview-guides/registry';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const [companies, roles] = await Promise.all([
    listRegistryCompanies(),
    listRegistryRoles(),
  ]);

  const urls: Array<{ loc: string; lastmod: string }> = [];

  for (const prefix of ['', '/en'] as const) {
    urls.push({
      loc: `${SITE_URL}${prefix}/interview-guide`,
      lastmod: GUIDE_TEMPLATE_UPDATED_AT,
    });
    urls.push({
      loc: `${SITE_URL}${prefix}/interview-guide/role`,
      lastmod: GUIDE_TEMPLATE_UPDATED_AT,
    });
  }

  for (const c of companies) {
    const lastmod = (c.lastJobAt || GUIDE_TEMPLATE_UPDATED_AT).slice(0, 10);
    for (const prefix of ['', '/en'] as const) {
      urls.push({
        loc: `${SITE_URL}${prefix}/interview-guide/${c.slug}`,
        lastmod,
      });
    }
  }

  for (const r of roles) {
    const lastmod = (r.lastJobAt || GUIDE_TEMPLATE_UPDATED_AT).slice(0, 10);
    for (const prefix of ['', '/en'] as const) {
      urls.push({
        loc: `${SITE_URL}${prefix}/interview-guide/role/${r.slug}`,
        lastmod,
      });
    }
  }

  // Google soft limit ~50k URLs/file — split before 45k.
  const MAX_URLS_PER_FILE = 45_000;
  if (urls.length > MAX_URLS_PER_FILE) {
    const parts = Math.ceil(urls.length / MAX_URLS_PER_FILE);
    const indexBody = Array.from({ length: parts }, (_, i) => {
      const loc = `${SITE_URL}/sitemap-interview-guides-${i + 1}.xml`;
      return `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${GUIDE_TEMPLATE_UPDATED_AT}</lastmod>\n  </sitemap>`;
    }).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexBody}\n</sitemapindex>\n`;
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
