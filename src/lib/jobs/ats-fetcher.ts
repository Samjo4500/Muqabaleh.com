/**
 * Legal MENA ATS job fetcher — Section 10 compliance.
 *
 * RULES (never break):
 * - Only Greenhouse / Lever / Workable / Recruitee public APIs
 * - Check robots.txt before first request to a domain
 * - Rate limit: 1 request/second per domain
 * - User-Agent: MuqabalehBot/1.0 (...)
 * - 300-char description max
 * - Log every request to JobFetchLog
 * - No LinkedIn/Indeed/Bayt/headless browsers
 */

import { db } from '@/lib/db';
import type { ListedJobSource } from '@prisma/client';

export const MUQABALEH_UA =
  'MuqabalehBot/1.0 (https://muqabaleh.com; contact@muqabaleh.com)';

const DESC_MAX = 300;
const MIN_DOMAIN_GAP_MS = 1000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

type NormalizedJob = {
  externalId: string;
  title: string;
  location: string;
  department?: string;
  employmentType?: string;
  description: string;
  applyUrl: string;
  postedAt: Date;
};

const lastHitByDomain = new Map<string, number>();
const robotsCache = new Map<string, { allowed: boolean; checkedAt: number }>();

function truncateDesc(text: string | null | undefined): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'See original posting for full details.';
  return clean.length > DESC_MAX ? `${clean.slice(0, DESC_MAX - 1)}…` : clean;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'role';
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

async function respectRateLimit(domain: string) {
  const last = lastHitByDomain.get(domain) ?? 0;
  const wait = MIN_DOMAIN_GAP_MS - (Date.now() - last);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastHitByDomain.set(domain, Date.now());
}

async function robotsAllows(origin: string, path: string): Promise<boolean> {
  const key = `${origin}${path}`;
  const cached = robotsCache.get(origin);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL_MS) {
    return cached.allowed;
  }

  try {
    await respectRateLimit(domainOf(origin));
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { 'User-Agent': MUQABALEH_UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      // Fail closed for unknown robots — skip domain
      robotsCache.set(origin, { allowed: false, checkedAt: Date.now() });
      return false;
    }
    const text = await res.text();
    const lines = text.split('\n').map((l) => l.trim());
    let appliesToUs = false;
    let disallowed = false;
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith('user-agent:')) {
        const ua = lower.slice('user-agent:'.length).trim();
        appliesToUs = ua === '*' || ua.includes('muqabalehbot');
      } else if (appliesToUs && lower.startsWith('disallow:')) {
        const rule = line.slice(line.indexOf(':') + 1).trim();
        if (rule === '/' || (rule && path.startsWith(rule))) {
          disallowed = true;
        }
      }
    }
    const allowed = !disallowed;
    robotsCache.set(origin, { allowed, checkedAt: Date.now() });
    return allowed;
  } catch {
    robotsCache.set(origin, { allowed: false, checkedAt: Date.now() });
    return false;
  }
}

async function loggedFetch(
  url: string,
  companyId: string | null,
): Promise<{ ok: boolean; status: number; text: string }> {
  const domain = domainOf(url);
  await respectRateLimit(domain);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': MUQABALEH_UA,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    await db.jobFetchLog.create({
      data: {
        companyId: companyId ?? undefined,
        url,
        statusCode: res.status,
        responseSize: text.length,
        errorMessage: res.ok ? null : `HTTP ${res.status}`,
      },
    });
    return { ok: res.ok, status: res.status, text };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'fetch failed';
    await db.jobFetchLog.create({
      data: {
        companyId: companyId ?? undefined,
        url,
        statusCode: null,
        responseSize: null,
        errorMessage: message,
      },
    });
    return { ok: false, status: 0, text: '' };
  }
}

function parseGreenhouse(json: unknown, boardSlug: string): NormalizedJob[] {
  const root = json as { jobs?: Array<Record<string, unknown>> };
  const jobs = Array.isArray(root?.jobs) ? root.jobs : [];
  return jobs.map((job) => {
    const id = String(job.id ?? '');
    const loc =
      typeof job.location === 'object' && job.location
        ? String((job.location as { name?: string }).name || 'Remote')
        : 'Remote';
    const dept = Array.isArray(job.departments)
      ? String((job.departments[0] as { name?: string } | undefined)?.name || '')
      : '';
    const content = String(job.content || job.absolute_url || '');
    return {
      externalId: id,
      title: String(job.title || 'Role'),
      location: loc,
      department: dept || undefined,
      employmentType: undefined,
      description: truncateDesc(content.replace(/<[^>]+>/g, ' ')),
      applyUrl: String(job.absolute_url || `https://boards.greenhouse.io/${boardSlug}/jobs/${id}`),
      postedAt: job.updated_at ? new Date(String(job.updated_at)) : new Date(),
    };
  }).filter((j) => j.externalId);
}

function parseLever(json: unknown, companySlug: string): NormalizedJob[] {
  const jobs = Array.isArray(json) ? (json as Array<Record<string, unknown>>) : [];
  return jobs.map((job) => {
    const id = String(job.id ?? '');
    const cats = (job.categories || {}) as Record<string, string>;
    const lists = (job.lists || []) as Array<{ text?: string; content?: string }>;
    const snippet = lists.map((l) => l.text || l.content || '').join(' ');
    return {
      externalId: id,
      title: String(job.text || 'Role'),
      location: cats.location || 'Remote',
      department: cats.team || cats.department || undefined,
      employmentType: cats.commitment || undefined,
      description: truncateDesc(snippet || String(job.descriptionPlain || job.description || '')),
      applyUrl: String(job.hostedUrl || job.applyUrl || `https://jobs.lever.co/${companySlug}/${id}`),
      postedAt: job.createdAt ? new Date(Number(job.createdAt)) : new Date(),
    };
  }).filter((j) => j.externalId);
}

function parseWorkable(json: unknown, accountSlug: string): NormalizedJob[] {
  const root = json as { jobs?: Array<Record<string, unknown>> };
  const jobs = Array.isArray(root?.jobs) ? root.jobs : [];
  return jobs.map((job) => {
    const id = String(job.shortcode || job.id || '');
    return {
      externalId: id,
      title: String(job.title || 'Role'),
      location: String(job.city || job.location || 'Remote'),
      department: String(job.department || '') || undefined,
      employmentType: String(job.employment_type || '') || undefined,
      description: truncateDesc(String(job.description || job.snippet || '')),
      applyUrl: String(job.url || `https://apply.workable.com/${accountSlug}/j/${id}/`),
      postedAt: job.published_on ? new Date(String(job.published_on)) : new Date(),
    };
  }).filter((j) => j.externalId);
}

function parseRecruitee(json: unknown, slug: string): NormalizedJob[] {
  const root = json as { offers?: Array<Record<string, unknown>> };
  const offers = Array.isArray(root?.offers) ? root.offers : [];
  return offers.map((offer) => {
    const id = String(offer.id ?? '');
    return {
      externalId: id,
      title: String(offer.title || 'Role'),
      location: String(offer.location || offer.city || 'Remote'),
      department: String(offer.department || '') || undefined,
      employmentType: String(offer.employment_type_code || '') || undefined,
      description: truncateDesc(String(offer.description || offer.description_html || '').replace(/<[^>]+>/g, ' ')),
      applyUrl: String(offer.careers_url || `https://${slug}.recruitee.com/o/${id}`),
      postedAt: offer.published_at ? new Date(String(offer.published_at)) : new Date(),
    };
  }).filter((j) => j.externalId);
}

async function fetchForCompany(company: {
  id: string;
  slug: string;
  ats: string | null;
}): Promise<{ upserted: number; deactivated: number; skipped?: string }> {
  const ats = (company.ats || '').toUpperCase();
  // Ashby skipped in v1 — no headless browser / unreliable HTML
  if (ats === 'ASHBY') {
    return { upserted: 0, deactivated: 0, skipped: 'ashby_skipped' };
  }

  let url = '';
  let origin = '';
  let path = '';
  let source: ListedJobSource = 'GREENHOUSE';

  if (ats === 'GREENHOUSE') {
    origin = 'https://boards-api.greenhouse.io';
    path = `/v1/boards/${company.slug}/jobs`;
    url = `${origin}${path}`;
    source = 'GREENHOUSE';
  } else if (ats === 'LEVER') {
    origin = 'https://api.lever.co';
    path = `/v0/postings/${company.slug}`;
    url = `${origin}${path}`;
    source = 'LEVER';
  } else if (ats === 'WORKABLE') {
    origin = 'https://apply.workable.com';
    path = `/api/v1/widget/accounts/${company.slug}`;
    url = `${origin}${path}`;
    source = 'WORKABLE';
  } else if (ats === 'RECRUITEE') {
    origin = `https://${company.slug}.recruitee.com`;
    path = '/api/offers';
    url = `${origin}${path}`;
    source = 'RECRUITEE';
  } else {
    return { upserted: 0, deactivated: 0, skipped: 'unknown_ats' };
  }

  const allowed = await robotsAllows(origin, path);
  if (!allowed) {
    await db.jobFetchLog.create({
      data: {
        companyId: company.id,
        url: `${origin}/robots.txt`,
        statusCode: null,
        errorMessage: 'robots.txt disallows path — skipped',
      },
    });
    return { upserted: 0, deactivated: 0, skipped: 'robots_disallow' };
  }

  const { ok, status, text } = await loggedFetch(url, company.id);
  if (status === 404) {
    await db.listedCompany.update({
      where: { id: company.id },
      data: { isActive: false },
    });
    return { upserted: 0, deactivated: 0, skipped: '404_inactive' };
  }
  if (!ok) {
    return { upserted: 0, deactivated: 0, skipped: `http_${status}` };
  }

  let parsed: NormalizedJob[] = [];
  try {
    const json = JSON.parse(text) as unknown;
    if (source === 'GREENHOUSE') parsed = parseGreenhouse(json, company.slug);
    else if (source === 'LEVER') parsed = parseLever(json, company.slug);
    else if (source === 'WORKABLE') parsed = parseWorkable(json, company.slug);
    else if (source === 'RECRUITEE') parsed = parseRecruitee(json, company.slug);
  } catch {
    return { upserted: 0, deactivated: 0, skipped: 'parse_error' };
  }

  const seen = new Set<string>();
  const now = new Date();
  const ops = parsed.map((job) => {
    seen.add(job.externalId);
    const slug = `${slugify(job.title)}-${job.externalId.slice(0, 8)}`;
    return db.listedJob.upsert({
      where: {
        companyId_externalId: {
          companyId: company.id,
          externalId: job.externalId,
        },
      },
      create: {
        companyId: company.id,
        externalId: job.externalId,
        title: job.title,
        slug,
        location: job.location,
        department: job.department,
        employmentType: job.employmentType,
        description: job.description.slice(0, DESC_MAX),
        applyUrl: job.applyUrl,
        source,
        isActive: true,
        postedAt: job.postedAt,
        fetchedAt: now,
      },
      update: {
        title: job.title,
        location: job.location,
        department: job.department,
        employmentType: job.employmentType,
        description: job.description.slice(0, DESC_MAX),
        applyUrl: job.applyUrl,
        isActive: true,
        fetchedAt: now,
      },
    });
  });
  // Small parallel chunks — prod DATABASE_URL is PgBouncer with connection_limit=1
  const CHUNK = 5;
  let upserted = 0;
  for (let i = 0; i < ops.length; i += CHUNK) {
    await Promise.all(ops.slice(i, i + CHUNK));
    upserted += Math.min(CHUNK, ops.length - i);
  }

  const stale = await db.listedJob.findMany({
    where: {
      companyId: company.id,
      source,
      isActive: true,
      NOT: { externalId: { in: Array.from(seen) } },
    },
    select: { id: true },
  });
  if (stale.length) {
    await db.listedJob.updateMany({
      where: { id: { in: stale.map((s) => s.id) } },
      data: { isActive: false },
    });
  }

  return { upserted, deactivated: stale.length };
}

export async function runAtsFetchTick(opts?: { limit?: number }) {
  const limit = opts?.limit ?? 40;
  const companies = await db.listedCompany.findMany({
    where: { isActive: true, ats: { not: null } },
    orderBy: { updatedAt: 'asc' },
    take: limit,
    select: { id: true, slug: true, ats: true },
  });

  const summary = {
    companies: companies.length,
    upserted: 0,
    deactivated: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const company of companies) {
    try {
      const result = await fetchForCompany(company);
      summary.upserted += result.upserted;
      summary.deactivated += result.deactivated;
      if (result.skipped) summary.skipped += 1;
      await db.listedCompany.update({
        where: { id: company.id },
        data: { updatedAt: new Date() },
      });
    } catch (err) {
      summary.errors.push(
        `${company.slug}: ${err instanceof Error ? err.message : 'error'}`,
      );
    }
  }

  return summary;
}
