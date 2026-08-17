import { db } from '@/lib/db';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import { FEATURED_JOBS } from '@/components/jobs/featured-jobs';

export type NurtureJobCard = {
  company: string;
  role: string;
  location: string;
  department?: string | null;
  jobId?: string;
  companySlug?: string;
  jobSlug?: string;
};

function featuredFallback(city?: string | null): NurtureJobCard[] {
  const needle = (city || '').toLowerCase();
  const featured = FEATURED_JOBS.filter((j) =>
    needle && needle !== 'other'
      ? j.locationEn.toLowerCase().includes(needle)
      : true,
  );
  const pool = featured.length ? featured : FEATURED_JOBS;
  return pool.slice(0, 3).map((j) => ({
    company: j.company,
    role: j.titleEn,
    location: j.locationEn,
    jobId: j.id,
  }));
}

function demoFallback(): NurtureJobCard[] {
  return DEMO_JOBS.slice(0, 3).map((j) => ({
    company: j.company.name,
    role: j.title,
    location: j.location,
    department: j.department,
    jobId: j.id,
    companySlug: j.company.slug,
    jobSlug: j.slug,
  }));
}

export async function matchingRoles(opts: {
  city?: string | null;
  role?: string | null;
  take?: number;
}): Promise<NurtureJobCard[]> {
  const take = opts.take ?? 3;
  try {
    const city = opts.city && opts.city !== 'Other' ? opts.city : undefined;
    const role = opts.role?.trim();
    const jobs = await db.listedJob.findMany({
      where: {
        isActive: true,
        ...(city
          ? { location: { contains: city, mode: 'insensitive' } }
          : {}),
        ...(role
          ? { title: { contains: role.split(' ')[0] || role, mode: 'insensitive' } }
          : {}),
      },
      include: {
        company: { select: { name: true, slug: true, country: true } },
      },
      orderBy: { postedAt: 'desc' },
      take,
    });
    if (jobs.length >= take) {
      return jobs.map((j) => ({
        company: j.company?.name || 'MENA employer',
        role: j.title,
        location: j.location,
        department: j.department,
        jobId: j.id,
        companySlug: j.company?.slug,
        jobSlug: j.slug,
      }));
    }
    if (jobs.length > 0) {
      const extra = featuredFallback(opts.city).filter(
        (f) => !jobs.some((j) => j.title === f.role),
      );
      return [
        ...jobs.map((j) => ({
          company: j.company?.name || 'MENA employer',
          role: j.title,
          location: j.location,
          department: j.department,
          jobId: j.id,
          companySlug: j.company?.slug,
          jobSlug: j.slug,
        })),
        ...extra,
      ].slice(0, take);
    }
  } catch {
    /* fall through */
  }
  const featured = featuredFallback(opts.city);
  return featured.length ? featured : demoFallback();
}

export async function countActiveRoles(): Promise<number> {
  try {
    const n = await db.listedJob.count({ where: { isActive: true } });
    return n > 0 ? n : 403;
  } catch {
    return 403;
  }
}
