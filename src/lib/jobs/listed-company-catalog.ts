/**
 * Verified public ATS boards for MENA job ingest.
 * Only include boards that return HTTP 200 on their public API.
 * Global→MENA boards are filtered to regional locations at fetch time.
 */

export type ListedCompanySeed = {
  name: string;
  slug: string;
  ats: 'GREENHOUSE' | 'LEVER' | 'WORKABLE' | 'RECRUITEE';
  country: string;
  industry?: string;
};

/**
 * Live-verified Aug 2026 against public Greenhouse / Lever / Workable / Recruitee APIs.
 * Prefer regional HQs (UAE/KSA/Egypt…) — they unlock Remote/Hybrid rows under MENA filter.
 */
export const LISTED_COMPANY_CATALOG: ListedCompanySeed[] = [
  // ── Regional MENA employers ──
  { name: 'Careem', slug: 'careem', ats: 'GREENHOUSE', country: 'UAE', industry: 'Mobility' },
  { name: 'Tamara', slug: 'tamara', ats: 'GREENHOUSE', country: 'UAE/KSA', industry: 'Fintech' },
  { name: 'Jumia', slug: 'jumia', ats: 'GREENHOUSE', country: 'Egypt', industry: 'E-commerce' },
  { name: 'Aldar Properties', slug: 'aldar', ats: 'LEVER', country: 'UAE', industry: 'Real Estate' },
  { name: 'Fresha', slug: 'fresha', ats: 'LEVER', country: 'UAE/KSA', industry: 'SaaS' },
  { name: 'Foodics', slug: 'foodics', ats: 'WORKABLE', country: 'KSA', industry: 'SaaS' },
  { name: 'Trendyol', slug: 'trendyol', ats: 'LEVER', country: 'KSA/GCC', industry: 'E-commerce' },
  { name: 'Syarah', slug: 'syarah', ats: 'WORKABLE', country: 'KSA/Jordan', industry: 'Automotive' },
  { name: 'Unifonic', slug: 'unifonic', ats: 'RECRUITEE', country: 'KSA/UAE', industry: 'Communications' },
  { name: 'Lucid Motors', slug: 'lucidmotors', ats: 'GREENHOUSE', country: 'KSA/UAE', industry: 'Automotive' },

  // ── Global boards with verified MENA openings ──
  { name: 'Scale AI', slug: 'scaleai', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'AI' },
  { name: 'Udacity', slug: 'udacity', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'EdTech' },
  { name: 'Datadog', slug: 'datadog', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'SaaS' },
  { name: 'Cloudflare', slug: 'cloudflare', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'Infrastructure' },
  { name: 'GitLab', slug: 'gitlab', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'DevTools' },
  { name: 'Elastic', slug: 'elastic', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'SaaS' },
  { name: 'MongoDB', slug: 'mongodb', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'Database' },
  { name: 'Databricks', slug: 'databricks', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'Data' },
  { name: 'Palantir', slug: 'palantir', ats: 'LEVER', country: 'Global→MENA', industry: 'Software' },
  { name: 'Coinbase', slug: 'coinbase', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'Crypto' },
  { name: 'Stripe', slug: 'stripe', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'Fintech' },
  { name: 'Spotify', slug: 'spotify', ats: 'LEVER', country: 'Global→MENA', industry: 'Media' },
  { name: 'Box', slug: 'boxinc', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'SaaS' },
];
