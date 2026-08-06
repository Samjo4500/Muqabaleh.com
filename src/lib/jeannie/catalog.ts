import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { discoverExternalJobs, type DiscoveredJob } from './job-providers';

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function upsertDiscoveredJobs(jobs: DiscoveredJob[]) {
  let upserted = 0;
  for (const job of jobs) {
    await db.jeannieJobListing.upsert({
      where: {
        source_sourceJobId: { source: job.source, sourceJobId: job.sourceJobId },
      },
      create: {
        source: job.source,
        sourceJobId: job.sourceJobId,
        title: job.title.slice(0, 220),
        companyName: job.companyName.slice(0, 180),
        city: job.city || null,
        country: job.country || null,
        description: job.description || null,
        applyUrl: job.applyUrl || null,
        applyEmail: job.applyEmail || null,
        seniority: job.seniority || null,
        employmentType: job.employmentType || null,
        raw: (job.raw as Prisma.InputJsonValue | undefined) || undefined,
        fetchedAt: new Date(),
        expiresAt: daysFromNow(21),
        isActive: true,
      },
      update: {
        title: job.title.slice(0, 220),
        companyName: job.companyName.slice(0, 180),
        city: job.city || null,
        country: job.country || null,
        description: job.description || null,
        applyUrl: job.applyUrl || null,
        applyEmail: job.applyEmail || null,
        seniority: job.seniority || null,
        employmentType: job.employmentType || null,
        raw: (job.raw as Prisma.InputJsonValue | undefined) || undefined,
        fetchedAt: new Date(),
        expiresAt: daysFromNow(21),
        isActive: true,
      },
    });
    upserted += 1;
  }
  return upserted;
}

/** Refresh global catalog from external providers for the given targets. */
export async function refreshJobCatalog(opts: {
  roles: string[];
  countries: string[];
}) {
  const jobs = await discoverExternalJobs(opts);
  const count = await upsertDiscoveredJobs(jobs);
  return { fetched: jobs.length, upserted: count };
}

export async function findActiveListings(opts: {
  roles: string[];
  countries: string[];
  take?: number;
}) {
  const take = opts.take ?? 60;
  const roleFilters = opts.roles.filter(Boolean).slice(0, 6);
  const countryFilters = opts.countries.filter(Boolean).slice(0, 8);

  return db.jeannieJobListing.findMany({
    where: {
      isActive: true,
      OR: [
        ...(roleFilters.length
          ? roleFilters.map((role) => ({
              title: { contains: role, mode: 'insensitive' as const },
            }))
          : []),
        ...(countryFilters.length
          ? [{ country: { in: countryFilters } }]
          : []),
        { country: { contains: 'Remote', mode: 'insensitive' as const } },
      ],
    },
    orderBy: [{ fetchedAt: 'desc' }],
    take,
  });
}
