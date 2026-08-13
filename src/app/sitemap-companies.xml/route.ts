import {
  buildCompanyEntries,
  loadActiveCompaniesAndJobs,
  urlSetXml,
  xmlResponse,
} from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const companies = await loadActiveCompaniesAndJobs();
  return xmlResponse(urlSetXml(buildCompanyEntries(companies)));
}
