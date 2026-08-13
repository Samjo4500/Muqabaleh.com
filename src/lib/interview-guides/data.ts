import { db } from '@/lib/db';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import {
  getGuideCompany,
  getGuideRole,
  pickRelatedCompanies,
  pickRelatedRoles,
} from './catalog';
import type { GuideCompany, GuideRole, RelatedJobCard } from './types';

export type CompanyGuidePayload = {
  company: GuideCompany;
  openJobs: number;
  relatedJobs: RelatedJobCard[];
  relatedCompanies: GuideCompany[];
  relatedRoles: GuideRole[];
  listedCompanySlug: string | null;
};

export type RoleGuidePayload = {
  role: GuideRole;
  openJobs: number;
  relatedJobs: RelatedJobCard[];
  relatedCompanies: GuideCompany[];
  relatedRoles: GuideRole[];
};

async function queryCompanyJobs(company: GuideCompany): Promise<{
  openJobs: number;
  relatedJobs: RelatedJobCard[];
  listedCompanySlug: string | null;
}> {
  const names = [company.name.en, company.name.ar, ...(company.aliases || [])];
  try {
    const listed = await db.listedCompany.findFirst({
      where: {
        isActive: true,
        OR: [
          { slug: company.slug },
          ...(company.aliases?.length
            ? [{ slug: { in: company.aliases } }]
            : []),
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
}> {
  const matchers = role.titleMatchers;
  try {
    const rows = await db.listedJob.findMany({
      where: {
        isActive: true,
        company: { isActive: true },
        OR: matchers.map((m) => ({
          title: { contains: m, mode: 'insensitive' as const },
        })),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        company: { select: { name: true, slug: true } },
      },
      orderBy: { postedAt: 'desc' },
      take: 24,
    });

    const relatedJobs = rows
      .filter((j) => j.company)
      .slice(0, 6)
      .map((j) => ({
        id: j.id,
        title: j.title,
        slug: j.slug,
        location: j.location,
        companyName: j.company!.name,
        companySlug: j.company!.slug,
      }));

    return { openJobs: rows.length, relatedJobs };
  } catch (err) {
    console.error('[interview-guide] role jobs', err);
  }

  const demo = DEMO_JOBS.filter((j) => {
    const t = j.title.toLowerCase();
    return matchers.some((m) => t.includes(m.toLowerCase()));
  });

  return {
    openJobs: demo.length,
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

export async function loadCompanyGuide(
  slug: string,
): Promise<CompanyGuidePayload | null> {
  if (slug === 'role') return null;
  const company = getGuideCompany(slug);
  if (!company) return null;

  const jobs = await queryCompanyJobs(company);
  return {
    company,
    openJobs: jobs.openJobs,
    relatedJobs: jobs.relatedJobs,
    listedCompanySlug: jobs.listedCompanySlug,
    relatedCompanies: pickRelatedCompanies(company.relatedCompanySlugs, company.slug),
    relatedRoles: pickRelatedRoles(company.relatedRoleSlugs),
  };
}

export async function loadRoleGuide(slug: string): Promise<RoleGuidePayload | null> {
  const role = getGuideRole(slug);
  if (!role) return null;

  const jobs = await queryRoleJobs(role);
  return {
    role,
    openJobs: jobs.openJobs,
    relatedJobs: jobs.relatedJobs,
    relatedCompanies: pickRelatedCompanies(role.relatedCompanySlugs),
    relatedRoles: pickRelatedRoles(role.relatedRoleSlugs, role.slug),
  };
}
