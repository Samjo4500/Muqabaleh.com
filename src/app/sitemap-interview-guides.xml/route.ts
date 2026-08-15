import { buildGuidesSitemapXml } from '@/lib/sitemaps/guides';

export const revalidate = 86400;

export async function GET() {
  const { xml } = await buildGuidesSitemapXml();
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
