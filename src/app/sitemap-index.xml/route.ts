import { sitemapIndexXml } from '@/lib/sitemaps/xml';
import { sitemapIndexLocs } from '@/lib/sitemaps/static-urls';

/** Cheap static index — no DB. public/sitemap-index.xml is the committed copy. */
export const revalidate = 86400;

export function GET() {
  return new Response(sitemapIndexXml(sitemapIndexLocs()), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
