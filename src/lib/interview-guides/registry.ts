import { db } from '@/lib/db';
import { inferCoachRoleIdFromTitle } from '@/lib/jobs/jeannie-practice';
import {
  GUIDE_COMPANIES,
  GUIDE_ROLES,
  getGuideCompany,
  getGuideRole,
} from './catalog';
import {
  companyAboutVariant,
  companyHookVariant,
  cultureTipsVariant,
  roleAboutVariant,
} from './variants';
import type { Bi, GuideCompany, GuideRole } from './types';

export const COMPANY_GUIDE_CAP = 150;
export const ROLE_GUIDE_CAP = 50;
export const MIN_COMPANY_JOBS = 3;
export const MIN_ROLE_JOBS = 2;
/** Template refresh stamp for lastmod when job dates are missing. */
export const GUIDE_TEMPLATE_UPDATED_AT = '2026-08-13';

const DEFAULT_ROLE_SALARY: Bi = {
  en: 'Varies by market and seniority across UAE, KSA, and Egypt hubs',
  ar: 'يختلف حسب السوق والأقدمية عبر مراكز الإمارات والسعودية ومصر',
};

const DEFAULT_COMPANY_SALARY: Bi = {
  en: 'Competitive MENA packages; verify published pay on each posting',
  ar: 'حزم تنافسية في المنطقة؛ تحقّق من الراتب المعلن في كل إعلان',
};

function biName(name: string): Bi {
  return { en: name, ar: name };
}

function difficultyFromSlug(slug: string): 1 | 2 | 3 | 4 | 5 {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i)) % 5;
  return ((h % 5) + 1) as 1 | 2 | 3 | 4 | 5;
}

function companyQuestions(name: Bi): Bi[] {
  return [
    {
      en: `Why ${name.en}, and why now?`,
      ar: `لماذا ${name.ar}، ولماذا الآن؟`,
    },
    {
      en: `Tell us about a time you delivered under ambiguity at scale.`,
      ar: `حدّثنا عن مرة سلّمت فيها تحت الغموض وعلى نطاق واسع.`,
    },
    {
      en: `How would you improve a product or process at ${name.en}?`,
      ar: `كيف تحسّن منتجاً أو عملية في ${name.ar}؟`,
    },
  ];
}

function roleQuestions(name: Bi): Bi[] {
  return [
    {
      en: `Walk me through a ${name.en} project you owned end-to-end.`,
      ar: `اسرد مشروعاً كـ ${name.ar} تولّيته من البداية للنهاية.`,
    },
    {
      en: `How do you prioritize when everything feels urgent?`,
      ar: `كيف ترتّب الأولويات حين يبدو كل شيء عاجلاً؟`,
    },
    {
      en: `Describe a conflict with a stakeholder and how you resolved it.`,
      ar: `صف خلافاً مع صاحب مصلحة وكيف حللته.`,
    },
    {
      en: `What metric proves you are good at this craft?`,
      ar: `ما المقياس الذي يثبت أنك متقن لهذه الحرفة؟`,
    },
    {
      en: `Tell us about a failure and what changed afterward.`,
      ar: `حدّثنا عن فشل وما تغيّر بعده.`,
    },
    {
      en: `How do you keep learning in a fast MENA market?`,
      ar: `كيف تواصل التعلّم في سوق سريع بالمنطقة؟`,
    },
    {
      en: `Why this ${name.en} path versus adjacent roles?`,
      ar: `لماذا مسار ${name.ar} مقارنة بأدوار مجاورة؟`,
    },
  ];
}

export function listedToGuideCompany(row: {
  slug: string;
  name: string;
  country: string;
  industry: string | null;
  logoUrl?: string | null;
  website?: string | null;
}): GuideCompany {
  const base: GuideCompany = {
    slug: row.slug,
    name: biName(row.name),
    country: biName(row.country || 'MENA'),
    industry: biName(row.industry || 'Business'),
    about: { en: '', ar: '' },
    hook: { en: '', ar: '' },
    difficulty: difficultyFromSlug(row.slug),
    salaryHint: DEFAULT_COMPANY_SALARY,
    companyQuestions: companyQuestions(biName(row.name)),
    cultureTips: {
      en: 'Smart professional attire for most tech interviews; more formal for banks and enterprise.',
      ar: 'لباس مهني أنيق لمعظم مقابلات التقنية؛ أكثر رسمية للبنوك والمؤسسات.',
    },
    relatedCompanySlugs: [],
    relatedRoleSlugs: ['software-engineer', 'product-manager', 'project-manager'],
    publishedAt: GUIDE_TEMPLATE_UPDATED_AT,
    logoUrl: row.logoUrl || null,
    website: row.website || null,
    source: 'listed',
  };
  base.about = companyAboutVariant(base);
  base.hook = companyHookVariant(base);
  base.cultureTips = cultureTipsVariant(base.slug, base.cultureTips);
  return base;
}

export function buildGuideRole(opts: {
  slug: string;
  nameEn: string;
  nameAr: string;
  coachRoleId: string;
  titleMatchers: string[];
}): GuideRole {
  const base: GuideRole = {
    slug: opts.slug,
    name: { en: opts.nameEn, ar: opts.nameAr },
    coachRoleId: opts.coachRoleId,
    about: { en: '', ar: '' },
    hook: {
      en: `Show clear ${opts.nameEn} judgment with MENA-relevant examples.`,
      ar: `أظهر حكم ${opts.nameAr} واضحاً بأمثلة من سياق المنطقة.`,
    },
    difficulty: difficultyFromSlug(opts.slug),
    salaryHint: DEFAULT_ROLE_SALARY,
    questions: roleQuestions({ en: opts.nameEn, ar: opts.nameAr }),
    answerTips: {
      en: 'Quantify impact and name your personal contribution.',
      ar: 'رقّم الأثر واذكر مساهمتك الشخصية.',
    },
    cultureTips: {
      en: 'Smart professional dress; bilingual clarity is a plus.',
      ar: 'لباس مهني أنيق؛ الوضوح ثنائي اللغة ميزة.',
    },
    titleMatchers: opts.titleMatchers,
    relatedRoleSlugs: ['software-engineer', 'product-manager', 'project-manager'].filter(
      (s) => s !== opts.slug,
    ),
    relatedCompanySlugs: ['careem', 'noon', 'stc'],
    publishedAt: GUIDE_TEMPLATE_UPDATED_AT,
    source: 'listed',
  };
  base.about = roleAboutVariant(base);
  base.cultureTips = cultureTipsVariant(base.slug, base.cultureTips);
  return base;
}

export type RegistryCompany = GuideCompany & {
  jobCount: number;
  lastJobAt: string | null;
};

export type RegistryRole = GuideRole & {
  jobCount: number;
  lastJobAt: string | null;
};

/**
 * Companies eligible for Phase 2 generation:
 * - Phase 1 curated catalog (always)
 * - Listed companies with ≥3 active jobs and an industry (description proxy)
 * Logos preferred but not required — current ATS ingest rarely stores logoUrl.
 * Cap: 150, sorted by job count.
 */
export async function listRegistryCompanies(): Promise<RegistryCompany[]> {
  const bySlug = new Map<string, RegistryCompany>();

  for (const c of GUIDE_COMPANIES) {
    bySlug.set(c.slug, {
      ...c,
      about: companyAboutVariant(c),
      hook: companyHookVariant(c),
      cultureTips: cultureTipsVariant(c.slug, c.cultureTips),
      jobCount: 0,
      lastJobAt: null,
      source: c.source || 'phase1',
    });
  }

  try {
    const rows = await db.listedCompany.findMany({
      where: { isActive: true, industry: { not: null } },
      select: {
        slug: true,
        name: true,
        country: true,
        industry: true,
        logoUrl: true,
        website: true,
        jobs: {
          select: { postedAt: true, updatedAt: true, isActive: true },
          orderBy: { postedAt: 'desc' },
        },
      },
    });

    const eligible = rows
      .map((r) => {
        const activeJobs = r.jobs.filter((j) => j.isActive);
        return {
          row: r,
          jobCount: activeJobs.length,
          everJobs: r.jobs.length,
          lastJobAt: (activeJobs[0] || r.jobs[0])?.postedAt?.toISOString?.() || null,
        };
      })
      // Soft-keep: once a company hit ≥3 jobs (incl. expired), keep the guide page
      .filter((x) => x.jobCount >= MIN_COMPANY_JOBS || x.everJobs >= MIN_COMPANY_JOBS)
      .sort((a, b) => b.jobCount - a.jobCount || b.everJobs - a.everJobs)
      .slice(0, COMPANY_GUIDE_CAP);

    // Optional salary labels for FAQ inserts
    const salaryRows = await db.listedJob.findMany({
      where: {
        isActive: true,
        salaryLabel: { not: null },
        company: { slug: { in: eligible.map((e) => e.row.slug) } },
      },
      select: { salaryLabel: true, company: { select: { slug: true } } },
      take: 400,
    });
    const salaryBySlug = new Map<string, string>();
    for (const s of salaryRows) {
      if (s.company?.slug && s.salaryLabel && !salaryBySlug.has(s.company.slug)) {
        salaryBySlug.set(s.company.slug, s.salaryLabel);
      }
    }

    for (const { row, jobCount, lastJobAt } of eligible) {
      const existing = bySlug.get(row.slug);
      const salaryLabel = salaryBySlug.get(row.slug);
      if (existing) {
        existing.jobCount = Math.max(existing.jobCount, jobCount);
        existing.lastJobAt = lastJobAt;
        if (row.logoUrl) existing.logoUrl = row.logoUrl;
        if (salaryLabel) {
          existing.salaryHint = { en: salaryLabel, ar: salaryLabel };
        }
        continue;
      }
      if (bySlug.size >= COMPANY_GUIDE_CAP) break;
      const built = listedToGuideCompany({
        slug: row.slug,
        name: row.name,
        country: row.country,
        industry: row.industry,
        logoUrl: row.logoUrl,
        website: row.website,
      });
      if (salaryLabel) {
        built.salaryHint = { en: salaryLabel, ar: salaryLabel };
      }
      bySlug.set(row.slug, { ...built, jobCount, lastJobAt });
    }
  } catch (err) {
    console.error('[interview-guides] listRegistryCompanies', err);
  }

  // Fill related slugs from neighbors
  const all = [...bySlug.values()].sort((a, b) => b.jobCount - a.jobCount);
  for (const c of all) {
    if (!c.relatedCompanySlugs.length) {
      c.relatedCompanySlugs = all
        .filter((x) => x.slug !== c.slug)
        .slice(0, 3)
        .map((x) => x.slug);
    }
  }
  return all;
}

/**
 * Roles: Phase 1 + coach clusters with ≥2 matching active jobs, cap 50.
 */
export async function listRegistryRoles(): Promise<RegistryRole[]> {
  const bySlug = new Map<string, RegistryRole>();

  for (const r of GUIDE_ROLES) {
    bySlug.set(r.slug, {
      ...r,
      about: roleAboutVariant(r),
      cultureTips: cultureTipsVariant(r.slug, r.cultureTips),
      jobCount: 0,
      lastJobAt: null,
      source: r.source || 'phase1',
    });
  }

  try {
    const jobs = await db.listedJob.findMany({
      where: { company: { isActive: true } },
      select: { title: true, postedAt: true, isActive: true },
      take: 8000,
    });

    const clusterCounts = new Map<
      string,
      { active: number; ever: number; last: Date | null; sample: string }
    >();
    for (const j of jobs) {
      const coachId = inferCoachRoleIdFromTitle(j.title);
      const cur = clusterCounts.get(coachId) || {
        active: 0,
        ever: 0,
        last: null,
        sample: j.title,
      };
      cur.ever += 1;
      if (j.isActive) cur.active += 1;
      if (!cur.last || j.postedAt > cur.last) cur.last = j.postedAt;
      clusterCounts.set(coachId, cur);
    }

    const ranked = [...clusterCounts.entries()]
      // Soft-keep roles that previously met the ≥2 threshold
      .filter(([, v]) => v.active >= MIN_ROLE_JOBS || v.ever >= MIN_ROLE_JOBS)
      .sort((a, b) => b[1].active - a[1].active || b[1].ever - a[1].ever);

    for (const [coachId, meta] of ranked) {
      const phase1 = getGuideRole(coachId) || GUIDE_ROLES.find((r) => r.coachRoleId === coachId);
      if (phase1) {
        const existing = bySlug.get(phase1.slug)!;
        existing.jobCount = Math.max(existing.jobCount, meta.active);
        existing.lastJobAt = meta.last?.toISOString() || null;
        continue;
      }
      if (bySlug.size >= ROLE_GUIDE_CAP) continue;
      const label = coachId
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      const built = buildGuideRole({
        slug: coachId,
        nameEn: label,
        nameAr: label,
        coachRoleId: coachId,
        titleMatchers: [label.toLowerCase(), coachId.replace(/-/g, ' ')],
      });
      bySlug.set(built.slug, {
        ...built,
        jobCount: meta.active,
        lastJobAt: meta.last?.toISOString() || null,
      });
    }
  } catch (err) {
    console.error('[interview-guides] listRegistryRoles', err);
  }

  return [...bySlug.values()]
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, ROLE_GUIDE_CAP);
}

export async function resolveCompanyGuide(
  slug: string,
): Promise<{ company: GuideCompany; jobCount: number; lastJobAt: string | null } | null> {
  if (slug === 'role') return null;

  const phase1 = getGuideCompany(slug);
  if (phase1) {
    const enriched = {
      ...phase1,
      about: companyAboutVariant(phase1),
      hook: companyHookVariant(phase1),
      cultureTips: cultureTipsVariant(phase1.slug, phase1.cultureTips),
    };
    try {
      const count = await db.listedJob.count({
        where: { isActive: true, company: { slug, isActive: true } },
      });
      const latest = await db.listedJob.findFirst({
        where: { isActive: true, company: { slug } },
        orderBy: { postedAt: 'desc' },
        select: { postedAt: true },
      });
      return {
        company: enriched,
        jobCount: count,
        lastJobAt: latest?.postedAt?.toISOString() || null,
      };
    } catch {
      return { company: enriched, jobCount: 0, lastJobAt: null };
    }
  }

  try {
    const row = await db.listedCompany.findFirst({
      where: { slug, isActive: true },
      select: {
        slug: true,
        name: true,
        country: true,
        industry: true,
        logoUrl: true,
        website: true,
        jobs: {
          where: { isActive: true },
          select: { postedAt: true },
          orderBy: { postedAt: 'desc' },
        },
      },
    });
    // Soft-keep: show page if company exists with industry even if jobs < threshold
    if (!row?.industry) return null;
    const company = listedToGuideCompany(row);
    return {
      company,
      jobCount: row.jobs.length,
      lastJobAt: row.jobs[0]?.postedAt?.toISOString() || null,
    };
  } catch (err) {
    console.error('[interview-guides] resolveCompanyGuide', err);
    return null;
  }
}

export async function resolveRoleGuide(
  slug: string,
): Promise<{ role: GuideRole; jobCount: number; lastJobAt: string | null } | null> {
  const phase1 =
    getGuideRole(slug) || GUIDE_ROLES.find((r) => r.coachRoleId === slug) || null;
  if (phase1) {
    const enriched = {
      ...phase1,
      about: roleAboutVariant(phase1),
      cultureTips: cultureTipsVariant(phase1.slug, phase1.cultureTips),
    };
    try {
      const jobs = await db.listedJob.findMany({
        where: {
          isActive: true,
          company: { isActive: true },
          OR: phase1.titleMatchers.map((m) => ({
            title: { contains: m, mode: 'insensitive' as const },
          })),
        },
        select: { postedAt: true },
        orderBy: { postedAt: 'desc' },
        take: 200,
      });
      return {
        role: enriched,
        jobCount: jobs.length,
        lastJobAt: jobs[0]?.postedAt?.toISOString() || null,
      };
    } catch {
      return { role: enriched, jobCount: 0, lastJobAt: null };
    }
  }

  // Dynamic coach-id role pages (only if they meet / met the threshold via active jobs)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const label = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const role = buildGuideRole({
    slug,
    nameEn: label,
    nameAr: label,
    coachRoleId: slug,
    titleMatchers: [label.toLowerCase(), slug.replace(/-/g, ' ')],
  });

  try {
    const jobs = await db.listedJob.findMany({
      where: { company: { isActive: true } },
      select: { title: true, postedAt: true, isActive: true },
      take: 8000,
    });
    const matched = jobs.filter((j) => inferCoachRoleIdFromTitle(j.title) === slug);
    if (matched.length === 0) return null;
    const active = matched.filter((j) => j.isActive);
    // Soft-keep: allow below threshold / zero active when any matching jobs existed
    if (active.length < MIN_ROLE_JOBS && matched.length < MIN_ROLE_JOBS) return null;
    active.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());
    const latest = active[0] || matched.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())[0];
    return {
      role,
      jobCount: active.length,
      lastJobAt: latest?.postedAt?.toISOString() || null,
    };
  } catch (err) {
    console.error('[interview-guides] resolveRoleGuide', err);
    return null;
  }
}

export async function allGuideCompanySlugsAsync(): Promise<string[]> {
  const list = await listRegistryCompanies();
  return list.map((c) => c.slug);
}

export async function allGuideRoleSlugsAsync(): Promise<string[]> {
  const list = await listRegistryRoles();
  return list.map((r) => r.slug);
}

/** True when a company guide is in the published registry (safe to link). */
export async function isPublishedCompanyGuide(slug: string): Promise<boolean> {
  const list = await listRegistryCompanies();
  return list.some((c) => c.slug === slug);
}

/** True when a role guide is in the published registry (safe to link). */
export async function isPublishedRoleGuide(slugOrCoachId: string): Promise<boolean> {
  const list = await listRegistryRoles();
  return list.some(
    (r) => r.slug === slugOrCoachId || r.coachRoleId === slugOrCoachId,
  );
}
