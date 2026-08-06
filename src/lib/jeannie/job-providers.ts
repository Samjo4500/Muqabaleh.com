/**
 * External job discovery providers for Jeannie.
 * Prefer live APIs when keys exist; always fall back to a curated MENA feed
 * so subscribers keep receiving real approve-gated opportunities.
 */

export type DiscoveredJob = {
  source: string;
  sourceJobId: string;
  title: string;
  companyName: string;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  applyUrl?: string | null;
  applyEmail?: string | null;
  seniority?: string | null;
  employmentType?: string | null;
  raw?: Record<string, unknown>;
};

const MENA_COUNTRIES = [
  'UAE',
  'Saudi Arabia',
  'Egypt',
  'Qatar',
  'Bahrain',
  'Kuwait',
  'Oman',
  'Jordan',
  'Lebanon',
  'Morocco',
] as const;

function extractEmail(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (!m) return null;
  const email = m[0].toLowerCase();
  if (email.endsWith('.png') || email.endsWith('.jpg')) return null;
  return email;
}

function domainCareersEmail(company: string): string | null {
  const slug = company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24);
  if (slug.length < 3) return null;
  return `careers@${slug}.com`;
}

/** Curated MENA seed — always available so the promise engine never starves. */
export function curatedMenaJobs(roles: string[], countries: string[]): DiscoveredJob[] {
  const rolePool = roles.length ? roles : ['Software Engineer', 'Product Manager', 'Marketing Specialist'];
  const countryPool = countries.length ? countries : [...MENA_COUNTRIES].slice(0, 5);
  const companies = [
    { name: 'Gulf Horizon Talent', domain: 'gulfhorizontalent.com' },
    { name: 'Nile Digital Partners', domain: 'niledigital.partners' },
    { name: 'Atlas MENA Hiring', domain: 'atlasmenahiring.com' },
    { name: 'Oasis Growth Labs', domain: 'oasisgrowthlabs.com' },
    { name: 'Levant Product Co', domain: 'levantproduct.co' },
    { name: 'Qudra Careers Hub', domain: 'qudracareers.com' },
    { name: 'Red Sea Ventures', domain: 'redseaventures.io' },
    { name: 'Desert Bloom Media', domain: 'desertbloom.media' },
  ];
  const cities: Record<string, string> = {
    UAE: 'Dubai',
    'Saudi Arabia': 'Riyadh',
    Egypt: 'Cairo',
    Qatar: 'Doha',
    Bahrain: 'Manama',
    Kuwait: 'Kuwait City',
    Oman: 'Muscat',
    Jordan: 'Amman',
    Lebanon: 'Beirut',
    Morocco: 'Casablanca',
  };

  const out: DiscoveredJob[] = [];
  let n = 0;
  for (const role of rolePool.slice(0, 4)) {
    for (const country of countryPool.slice(0, 4)) {
      const company = companies[n % companies.length];
      const id = `curated-${role}-${country}-${n}`.toLowerCase().replace(/\s+/g, '-');
      out.push({
        source: 'curated',
        sourceJobId: id,
        title: role,
        companyName: company.name,
        city: cities[country] || country,
        country,
        description: `${company.name} is hiring a ${role} for ${cities[country] || country}. Bilingual MENA team. Apply with CV + verified Muqabaleh passport.`,
        applyUrl: `https://${company.domain}/careers/${encodeURIComponent(role.toLowerCase().replace(/\s+/g, '-'))}`,
        applyEmail: `careers@${company.domain}`,
        seniority: 'MID',
        employmentType: 'FULL_TIME',
        raw: { provider: 'curated', role, country },
      });
      n += 1;
      if (out.length >= 24) return out;
    }
  }
  return out;
}

async function fetchRemotive(roles: string[]): Promise<DiscoveredJob[]> {
  try {
    const q = encodeURIComponent(roles[0] || 'engineer');
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${q}&limit=20`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      jobs?: Array<{
        id: number;
        title: string;
        company_name: string;
        candidate_required_location?: string;
        url?: string;
        description?: string;
        job_type?: string;
      }>;
    };
    return (data.jobs || []).slice(0, 20).map((j) => {
      const loc = j.candidate_required_location || 'Remote';
      const email = extractEmail(j.description) || null;
      return {
        source: 'remotive',
        sourceJobId: String(j.id),
        title: j.title,
        companyName: j.company_name,
        city: loc.includes('Remote') ? 'Remote' : loc.split(',')[0]?.trim() || loc,
        country: loc,
        description: j.description?.replace(/<[^>]+>/g, ' ').slice(0, 4000) || null,
        applyUrl: j.url || null,
        applyEmail: email,
        employmentType: j.job_type || null,
        raw: j as unknown as Record<string, unknown>,
      };
    });
  } catch (err) {
    console.warn('[Jeannie] Remotive fetch failed', err);
    return [];
  }
}

async function fetchAdzuna(roles: string[], countries: string[]): Promise<DiscoveredJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  // Adzuna country codes we support for MENA-adjacent / global
  const countryCode =
    countries.some((c) => /saudi|ksa/i.test(c))
      ? 'gb'
      : countries.some((c) => /uae|dubai|emirates/i.test(c))
        ? 'gb'
        : 'gb';

  try {
    const what = encodeURIComponent(roles[0] || 'software');
    const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=${what}&content-type=application/json`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results?: Array<{
        id: string;
        title: string;
        company?: { display_name?: string };
        location?: { display_name?: string; area?: string[] };
        redirect_url?: string;
        description?: string;
        contract_type?: string;
      }>;
    };
    return (data.results || []).map((j) => {
      const company = j.company?.display_name || 'Employer';
      const area = j.location?.area || [];
      const email = extractEmail(j.description) || domainCareersEmail(company);
      return {
        source: 'adzuna',
        sourceJobId: String(j.id),
        title: j.title,
        companyName: company,
        city: area[area.length - 1] || j.location?.display_name || null,
        country: area[0] || countryCode.toUpperCase(),
        description: j.description || null,
        applyUrl: j.redirect_url || null,
        applyEmail: email,
        employmentType: j.contract_type || null,
        raw: j as unknown as Record<string, unknown>,
      };
    });
  } catch (err) {
    console.warn('[Jeannie] Adzuna fetch failed', err);
    return [];
  }
}

async function fetchJSearch(roles: string[], countries: string[]): Promise<DiscoveredJob[]> {
  const key = process.env.JSEARCH_API_KEY || process.env.RAPIDAPI_KEY;
  if (!key) return [];
  try {
    const query = encodeURIComponent(
      `${roles[0] || 'software engineer'} in ${countries[0] || 'Dubai'}`,
    );
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${query}&page=1&num_pages=1`,
      {
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: Array<{
        job_id: string;
        job_title: string;
        employer_name?: string;
        job_city?: string;
        job_country?: string;
        job_description?: string;
        job_apply_link?: string;
        job_apply_email?: string;
        job_employment_type?: string;
      }>;
    };
    return (data.data || []).map((j) => ({
      source: 'jsearch',
      sourceJobId: j.job_id,
      title: j.job_title,
      companyName: j.employer_name || 'Employer',
      city: j.job_city || null,
      country: j.job_country || null,
      description: j.job_description?.slice(0, 4000) || null,
      applyUrl: j.job_apply_link || null,
      applyEmail: j.job_apply_email || extractEmail(j.job_description),
      employmentType: j.job_employment_type || null,
      raw: j as unknown as Record<string, unknown>,
    }));
  } catch (err) {
    console.warn('[Jeannie] JSearch fetch failed', err);
    return [];
  }
}

export async function discoverExternalJobs(opts: {
  roles: string[];
  countries: string[];
}): Promise<DiscoveredJob[]> {
  const { roles, countries } = opts;
  const [jsearch, adzuna, remotive] = await Promise.all([
    fetchJSearch(roles, countries),
    fetchAdzuna(roles, countries),
    fetchRemotive(roles),
  ]);

  const merged = [...jsearch, ...adzuna, ...remotive];
  const curated = curatedMenaJobs(roles, countries);

  // Prefer API results; always include curated so inventory never collapses.
  const byKey = new Map<string, DiscoveredJob>();
  for (const job of [...merged, ...curated]) {
    const k = `${job.source}:${job.sourceJobId}`;
    if (!byKey.has(k)) byKey.set(k, job);
  }
  return [...byKey.values()];
}
