import { db } from '@/lib/db';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import { inferCoachRoleIdFromTitle } from '@/lib/jobs/jeannie-practice';
import {
  pickRelatedCompanies,
  pickRelatedRoles,
  getGuideCompany,
  getGuideRole,
  GUIDE_COMPANIES,
  GUIDE_ROLES,
} from './catalog';
import { resolveCompanyGuide, resolveRoleGuide } from './registry';
import type { GuideCompany, GuideRole, RelatedJobCard } from './types';

export type CompanyGuidePayload = {
  company: GuideCompany;
  openJobs: number;
  relatedJobs: RelatedJobCard[];
  relatedCompanies: GuideCompany[];
  relatedRoles: GuideRole[];
  listedCompanySlug: string | null;
  lastModified: string;
  noActiveJobs: boolean;
};

export type RoleGuidePayload = {
  role: GuideRole;
  openJobs: number;
  relatedJobs: RelatedJobCard[];
  relatedCompanies: GuideCompany[];
  relatedRoles: GuideRole[];
  lastModified: string;
  noActiveJobs: boolean;
};

async function queryCompanyJobs(company: GuideCompany): Promise<{
  openJobs: number;
  relatedJobs: RelatedJobCard[];
  listedCompanySlug: string | null;
  lastModified: string | null;
}> {
  const names = [company.name.en, company.name.ar, ...(company.aliases || [])];
  try {
    const listed = await db.listedCompany.findFirst({
      where: {
        isActive: true,
        OR: [
          { slug: company.slug },
          ...(company.aliases?.length ? [{ slug: { in: company.aliases } }] : []),
          { name: { equals: company.name.en, mode: 'insensitive' as const } },
        ],
      },
      select: {
        slug: true,
        jobs: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            postedAt: true,
            updatedAt: true,
          },
          orderBy: { postedAt: 'desc' },
          take: 6,
        },
      },
    });

    if (listed) {
      const openJobs = await db.listedJob.count({
        where: { isActive: true, company: { slug: listed.slug } },
      });
      return {
        openJobs,
        listedCompanySlug: listed.slug,
        lastModified: listed.jobs[0]?.postedAt?.toISOString() || null,
        relatedJobs: listed.jobs.map((j) => ({
          id: j.id,
          title: j.title,
          slug: j.slug,
          location: j.location,
          companyName: company.name.en,
          companySlug: listed.slug,
        })),
      };
    }
  } catch (err) {
    console.error('[interview-guide] company jobs', err);
  }

  const demo = DEMO_JOBS.filter((j) => {
    const hay = `${j.company.slug} ${j.company.name}`.toLowerCase();
    return names.some((n) => hay.includes(n.toLowerCase())) || j.company.slug === company.slug;
  });

  return {
    openJobs: demo.length,
    listedCompanySlug: demo[0]?.company.slug ?? null,
    lastModified: null,
    relatedJobs: demo.slice(0, 6).map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      location: j.location,
      companyName: j.company.name,
      companySlug: j.company.slug,
    })),
  };
}

async function queryRoleJobs(role: GuideRole): Promise<{
  openJobs: number;
  relatedJobs: RelatedJobCard[];
  lastModified: string | null;
}> {
  try {
    const rows = await db.listedJob.findMany({
      where: {
        isActive: true,
        company: { isActive: true },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        postedAt: true,
        company: { select: { name: true, slug: true } },
      },
      orderBy: { postedAt: 'desc' },
      take: 400,
    });

    const matched = rows.filter((j) => {
      if (!j.company) return false;
      if (inferCoachRoleIdFromTitle(j.title) === role.coachRoleId) return true;
      const t = j.title.toLowerCase();
      return role.titleMatchers.some((m) => t.includes(m.toLowerCase()));
    });

    return {
      openJobs: matched.length,
      lastModified: matched[0]?.postedAt?.toISOString() || null,
      relatedJobs: matched.slice(0, 6).map((j) => ({
        id: j.id,
        title: j.title,
        slug: j.slug,
        location: j.location,
        companyName: j.company!.name,
        companySlug: j.company!.slug,
      })),
    };
  } catch (err) {
    console.error('[interview-guide] role jobs', err);
  }

  const demo = DEMO_JOBS.filter((j) => {
    const t = j.title.toLowerCase();
    return role.titleMatchers.some((m) => t.includes(m.toLowerCase()));
  });

  return {
    openJobs: demo.length,
    lastModified: null,
    relatedJobs: demo.slice(0, 6).map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      location: j.location,
      companyName: j.company.name,
      companySlug: j.company.slug,
    })),
  };
}

/**
 * Related links must stay cheap — never call listRegistry* here.
 * Full registry scans during parallel static generation exhaust the
 * Supabase pooler and bake soft-404 pages into the Vercel deploy.
 */
function relatedCompanyEntities(slugs: string[], exclude?: string): GuideCompany[] {
  const picked = pickRelatedCompanies(slugs, exclude);
  if (picked.length >= 2) return picked;
  return GUIDE_COMPANIES.filter((c) => c.slug !== exclude).slice(0, 3);
}

function relatedRoleEntities(slugs: string[], exclude?: string): GuideRole[] {
  const picked = pickRelatedRoles(slugs, exclude);
  if (picked.length >= 2) return picked;
  return GUIDE_ROLES.filter((r) => r.slug !== exclude).slice(0, 3);
}

export async function loadCompanyGuide(
  slug: string,
): Promise<CompanyGuidePayload | null> {
  const resolved = await resolveCompanyGuide(slug);
  if (!resolved) return null;

  const jobs = await queryCompanyJobs(resolved.company);
  const openJobs = Math.max(jobs.openJobs, resolved.jobCount);
  return {
    company: resolved.company,
    openJobs,
    relatedJobs: jobs.relatedJobs,
    listedCompanySlug: jobs.listedCompanySlug || resolved.company.slug,
    relatedCompanies: relatedCompanyEntities(
      resolved.company.relatedCompanySlugs,
      resolved.company.slug,
    ),
    relatedRoles: relatedRoleEntities(resolved.company.relatedRoleSlugs),
    lastModified:
      jobs.lastModified ||
      resolved.lastJobAt ||
      resolved.company.publishedAt,
    noActiveJobs: openJobs === 0,
  };
}

export async function loadRoleGuide(slug: string): Promise<RoleGuidePayload | null> {
  const resolved = await resolveRoleGuide(slug);
  if (!resolved) return null;

  const jobs = await queryRoleJobs(resolved.role);
  const openJobs = Math.max(jobs.openJobs, resolved.jobCount);
  return {
    role: resolved.role,
    openJobs,
    relatedJobs: jobs.relatedJobs,
    relatedCompanies: relatedCompanyEntities(resolved.role.relatedCompanySlugs),
    relatedRoles: relatedRoleEntities(resolved.role.relatedRoleSlugs, resolved.role.slug),
    lastModified: jobs.lastModified || resolved.lastJobAt || resolved.role.publishedAt,
    noActiveJobs: openJobs === 0,
  };
}

/** Sync helpers kept for sitemap fallbacks / PopularGuides. */
export function phase1CompanySlugs(): string[] {
  return GUIDE_COMPANIES.map((c) => c.slug);
}
export function phase1RoleSlugs(): string[] {
  return GUIDE_ROLES.map((r) => r.slug);
}
export { getGuideCompany, getGuideRole };
