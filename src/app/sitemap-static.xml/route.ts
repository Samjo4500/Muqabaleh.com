import { buildStaticEntries, urlSetXml, xmlResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  return xmlResponse(urlSetXml(buildStaticEntries()));
}
