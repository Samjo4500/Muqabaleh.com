import {
  buildJobEntries,
  JOBS_PER_SITEMAP,
  loadActiveCompaniesAndJobs,
  urlSetXml,
  xmlResponse,
} from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const companies = await loadActiveCompaniesAndJobs();
  const all = buildJobEntries(companies);
  // Single file when under the 50k cap; otherwise page 1 of paginated set
  const slice = all.slice(0, JOBS_PER_SITEMAP);
  return xmlResponse(urlSetXml(slice));
}
