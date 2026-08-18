import { safeJobText } from '@/lib/jobs/job-details';

/** Soft cap for the public board RSC payload — newest first. */
export const JOBS_BOARD_TAKE = 280;

/** Spotlight blurb only — list rows do not render this. */
export const JOBS_BOARD_BLURB_MAX = 160;

export type JobsBoardCompany = {
  name: string;
  slug: string;
  country: string;
};

export type JobsBoardCard = {
  id: string;
  title: string;
  slug: string;
  location: string;
  department: string | null;
  employmentType: string | null;
  description: string;
  applyUrl: string;
  source: string;
  salaryLabel: string | null;
  postedAt: string | null;
  company: JobsBoardCompany | null;
};

export function toJobsBoardCard(row: {
  id: string;
  title: string;
  slug: string;
  location: string;
  department: string | null;
  employmentType: string | null;
  description: string;
  applyUrl: string;
  source: string;
  salaryLabel: string | null;
  postedAt?: Date | string | null;
  company: {
    name: string;
    slug: string;
    country: string;
  } | null;
}): JobsBoardCard {
  const posted =
    row.postedAt instanceof Date
      ? row.postedAt.toISOString()
      : row.postedAt
        ? String(row.postedAt)
        : null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    location: row.location,
    department: row.department,
    employmentType: row.employmentType,
    description: safeJobText(row.description, JOBS_BOARD_BLURB_MAX),
    applyUrl: row.applyUrl,
    source: row.source,
    salaryLabel: row.salaryLabel,
    postedAt: posted,
    company: row.company
      ? {
          name: row.company.name,
          slug: row.company.slug,
          country: row.company.country,
        }
      : null,
  };
}

export function latestPostedAtIso(jobs: Array<{ postedAt: string | null }>): string | null {
  let latest: string | null = null;
  for (const job of jobs) {
    if (!job.postedAt) continue;
    if (!latest || job.postedAt > latest) latest = job.postedAt;
  }
  return latest;
}

export function formatBoardPostedOn(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return d.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}
