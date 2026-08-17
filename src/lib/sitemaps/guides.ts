import {
  GUIDE_TEMPLATE_UPDATED_AT,
  listRegistryCompanies,
  listRegistryRoles,
} from '@/lib/interview-guides/registry';
import { sitemapIndexXml, urlsetXml } from './xml';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';
const MAX_URLS_PER_FILE = 45_000;

export async function buildGuidesSitemapXml(): Promise<{ xml: string; urls: number }> {
  const [companies, roles] = await Promise.all([
    listRegistryCompanies(),
    listRegistryRoles(),
  ]);

  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> =
    [];

  for (const prefix of ['', '/en'] as const) {
    urls.push({
      loc: `${SITE_URL}${prefix}/interview-guide`,
      lastmod: GUIDE_TEMPLATE_UPDATED_AT,
      changefreq: 'weekly',
      priority: '0.85',
    });
    urls.push({
      loc: `${SITE_URL}${prefix}/interview-guide/role`,
      lastmod: GUIDE_TEMPLATE_UPDATED_AT,
      changefreq: 'weekly',
      priority: '0.85',
    });
  }

  for (const c of companies) {
    const lastmod = (c.lastJobAt || GUIDE_TEMPLATE_UPDATED_AT).slice(0, 10);
    for (const prefix of ['', '/en'] as const) {
      urls.push({
        loc: `${SITE_URL}${prefix}/interview-guide/${c.slug}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.85',
      });
    }
  }

  for (const r of roles) {
    const lastmod = (r.lastJobAt || GUIDE_TEMPLATE_UPDATED_AT).slice(0, 10);
    for (const prefix of ['', '/en'] as const) {
      urls.push({
        loc: `${SITE_URL}${prefix}/interview-guide/role/${r.slug}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.85',
      });
    }
  }

  if (urls.length > MAX_URLS_PER_FILE) {
    const parts = Math.ceil(urls.length / MAX_URLS_PER_FILE);
    const xml = sitemapIndexXml(
      Array.from({ length: parts }, (_, i) => ({
        loc: `${SITE_URL}/sitemap-interview-guides-${i + 1}.xml`,
        lastmod: GUIDE_TEMPLATE_UPDATED_AT,
      })),
    );
    return { xml, urls: urls.length };
  }

  return { xml: urlsetXml(urls), urls: urls.length };
}
