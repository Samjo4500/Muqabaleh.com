import { buildStaticSitemapEntries } from '@/lib/sitemaps/static-urls';
import { urlsetXml } from '@/lib/sitemaps/xml';

export const revalidate = 86400;

export function GET() {
  const now = new Date().toISOString().slice(0, 10);
  const xml = urlsetXml(
    buildStaticSitemapEntries(`${now}T00:00:00.000Z`).map((e) => ({
      loc: e.url,
      lastmod: now,
      changefreq: e.changeFrequency,
      priority: String(e.priority),
    })),
  );
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
