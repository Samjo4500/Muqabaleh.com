import { buildJobsSitemapXml } from '@/lib/sitemaps/jobs';

export const revalidate = 3600;

export async function GET() {
  const { xml } = await buildJobsSitemapXml();
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
