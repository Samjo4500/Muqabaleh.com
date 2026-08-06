import { createHash } from 'crypto';
import { db } from '@/lib/db';
import { JeannieOpportunityStatus } from '@prisma/client';
import { getOrCreateJeannieProfile } from './profile';

const TERMINAL: JeannieOpportunityStatus[] = [
  JeannieOpportunityStatus.APPROVED,
  JeannieOpportunityStatus.APPLYING,
  JeannieOpportunityStatus.PACKET_READY,
  JeannieOpportunityStatus.APPLIED,
  JeannieOpportunityStatus.REJECTED_BY_USER,
  JeannieOpportunityStatus.EXPIRED,
];

function scoreJob(opts: {
  title: string;
  city?: string | null;
  country?: string | null;
  careerLevel?: string | null;
  roles: string[];
  cities: string[];
  countries: string[];
  seniority?: string | null;
  passportScore?: number | null;
}) {
  let score = 40;
  const titleLower = opts.title.toLowerCase();
  for (const role of opts.roles) {
    if (role && titleLower.includes(role.toLowerCase())) score += 25;
  }
  if (opts.city && opts.cities.some((c) => c.toLowerCase() === opts.city!.toLowerCase())) {
    score += 15;
  }
  if (
    opts.country &&
    opts.countries.some((c) => c.toLowerCase() === opts.country!.toLowerCase())
  ) {
    score += 10;
  }
  if (
    opts.seniority &&
    opts.careerLevel &&
    opts.careerLevel.toLowerCase().includes(opts.seniority.toLowerCase())
  ) {
    score += 8;
  }
  if (opts.passportScore && opts.passportScore >= 70) score += 8;
  else if (opts.passportScore && opts.passportScore >= 50) score += 4;
  return Math.max(0, Math.min(99, score));
}

function idempotency(userId: string, key: string) {
  return createHash('sha256').update(`${userId}:${key}`).digest('hex').slice(0, 32);
}

/**
 * Build / refresh Jeannie shortlist.
 * Prefers public OPEN B2B jobs; supplements with target-based external stubs
 * while the marketplace is parked (NOT SPAM — still requires approval).
 * Terminal statuses (approved / applied / packet / rejected) are preserved.
 */
export async function generateShortlist(userId: string, limit = 8) {
  const profile = await getOrCreateJeannieProfile(userId);
  if (!profile.isActive) {
    return listActiveShortlist(userId, limit);
  }

  const pool = await db.candidatePool.findUnique({ where: { userId } });
  const roles = profile.targetRoles.length
    ? profile.targetRoles
    : pool?.desiredRole
      ? [pool.desiredRole]
      : pool?.role
        ? [pool.role]
        : ['Professional'];

  const jobs = await db.b2BJob.findMany({
    where: {
      isPublic: true,
      status: 'OPEN',
      OR: [
        ...roles.map((role) => ({
          title: { contains: role, mode: 'insensitive' as const },
        })),
        ...(profile.targetCountries.length
          ? [{ country: { in: profile.targetCountries } }]
          : []),
      ],
    },
    include: { company: { select: { name: true } } },
    take: 40,
    orderBy: { createdAt: 'desc' },
  });

  const created: Awaited<ReturnType<typeof db.jeannieOpportunity.upsert>>[] = [];

  for (const job of jobs) {
    const matchScore = scoreJob({
      title: job.title,
      city: job.city,
      country: job.country,
      careerLevel: job.careerLevel,
      roles,
      cities: profile.targetCities,
      countries: profile.targetCountries,
      seniority: profile.seniority,
      passportScore: pool?.muqabalehScore,
    });
    if (matchScore < 45) continue;

    const key = idempotency(userId, `job:${job.id}`);
    const existing = await db.jeannieOpportunity.findUnique({
      where: { idempotencyKey: key },
    });

    if (existing && TERMINAL.includes(existing.status)) {
      created.push(existing);
      if (created.length >= limit) break;
      continue;
    }

    const row = await db.jeannieOpportunity.upsert({
      where: { idempotencyKey: key },
      create: {
        userId,
        status: JeannieOpportunityStatus.AWAITING_APPROVAL,
        b2bJobId: job.id,
        companyName: job.company?.name || 'Company',
        title: job.title,
        titleAr: job.titleAr,
        city: job.city,
        country: job.country,
        matchScore,
        matchReason: `Matched to your targets and passport signal (score ${matchScore}).`,
        matchReasonAr: `مطابقة لأهدافك وإشارة جوازك (درجة ${matchScore}).`,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        idempotencyKey: key,
      },
      update: {
        matchScore,
        companyName: job.company?.name || 'Company',
        title: job.title,
        titleAr: job.titleAr,
        city: job.city,
        country: job.country,
        // Only reopen soft states — never clobber approved/applied history
        ...(existing &&
        (existing.status === JeannieOpportunityStatus.FAILED ||
          existing.status === JeannieOpportunityStatus.SUGGESTED ||
          existing.status === JeannieOpportunityStatus.AWAITING_APPROVAL)
          ? { status: JeannieOpportunityStatus.AWAITING_APPROVAL, failureReason: null }
          : {}),
      },
    });
    created.push(row);
    if (created.length >= limit) break;
  }

  // External stubs when marketplace density is low — still approve-gated.
  if (created.length < Math.min(3, limit)) {
    const city = profile.targetCities[0] || 'Dubai';
    const country = profile.targetCountries[0] || 'UAE';
    for (let i = created.length; i < Math.min(3, limit); i++) {
      const role = roles[i % roles.length] || 'Role';
      const stubKey = `external:${role}:${city}:${i}`;
      const key = idempotency(userId, stubKey);
      const matchScore = 70 + (i % 3) * 5;
      const existing = await db.jeannieOpportunity.findUnique({
        where: { idempotencyKey: key },
      });
      if (existing && TERMINAL.includes(existing.status)) {
        created.push(existing);
        continue;
      }
      const row = await db.jeannieOpportunity.upsert({
        where: { idempotencyKey: key },
        create: {
          userId,
          status: JeannieOpportunityStatus.AWAITING_APPROVAL,
          externalUrl: null,
          companyName: i === 0 ? 'Regional employer shortlist' : `Partner board ${i + 1}`,
          title: `${role}`,
          titleAr: role,
          city,
          country,
          matchScore,
          matchReason:
            'Target-fit shortlist while marketplace density grows. Approve only if you want Jeannie to prepare a professional apply packet.',
          matchReasonAr:
            'ترشيح حسب أهدافك بينما تنمو كثافة السوق. وافق فقط إذا أردت جيني تجهّز حزمة تقديم احترافية.',
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          idempotencyKey: key,
        },
        update: {
          matchScore,
          ...(existing &&
          (existing.status === JeannieOpportunityStatus.FAILED ||
            existing.status === JeannieOpportunityStatus.SUGGESTED ||
            existing.status === JeannieOpportunityStatus.AWAITING_APPROVAL)
            ? { status: JeannieOpportunityStatus.AWAITING_APPROVAL }
            : {}),
        },
      });
      created.push(row);
    }
  }

  return created.sort((a, b) => b.matchScore - a.matchScore);
}

async function listActiveShortlist(userId: string, limit: number) {
  return db.jeannieOpportunity.findMany({
    where: { userId },
    orderBy: [{ matchScore: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
}
