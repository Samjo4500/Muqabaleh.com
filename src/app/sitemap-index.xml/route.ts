import {
  sitemapIndexLocs,
  sitemapIndexXml,
  xmlResponse,
} from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const locs = await sitemapIndexLocs();
  return xmlResponse(sitemapIndexXml(locs));
}
