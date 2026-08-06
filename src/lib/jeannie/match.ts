import { createHash } from 'crypto';
import { db } from '@/lib/db';
import { JeannieOpportunityStatus } from '@prisma/client';
import { getOrCreateJeannieProfile } from './profile';
import { findActiveListings, refreshJobCatalog } from './catalog';
import { ensureActiveSlaPeriod } from './sla';

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
  seniority?: string | null;
  roles: string[];
  cities: string[];
  countries: string[];
  profileSeniority?: string | null;
  passportScore?: number | null;
  hasApplyEmail?: boolean;
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
    opts.countries.some((c) => opts.country!.toLowerCase().includes(c.toLowerCase()))
  ) {
    score += 12;
  }
  if (
    opts.profileSeniority &&
    opts.seniority &&
    opts.seniority.toLowerCase().includes(opts.profileSeniority.toLowerCase())
  ) {
    score += 8;
  }
  if (opts.passportScore && opts.passportScore >= 70) score += 8;
  else if (opts.passportScore && opts.passportScore >= 50) score += 4;
  if (opts.hasApplyEmail) score += 6;
  return Math.max(0, Math.min(99, score));
}

function idempotency(userId: string, key: string) {
  return createHash('sha256').update(`${userId}:${key}`).digest('hex').slice(0, 32);
}

/**
 * Build / refresh Jeannie shortlist from the external job catalog.
 * Refreshes providers first, then matches — approve-gated (NOT SPAM).
 */
export async function generateShortlist(userId: string, limit = 8) {
  await ensureActiveSlaPeriod(userId);

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

  await refreshJobCatalog({
    roles,
    countries: profile.targetCountries,
  });

  const listings = await findActiveListings({
    roles,
    countries: profile.targetCountries,
    take: 80,
  });

  const created: Awaited<ReturnType<typeof db.jeannieOpportunity.upsert>>[] = [];

  for (const listing of listings) {
    const matchScore = scoreJob({
      title: listing.title,
      city: listing.city,
      country: listing.country,
      seniority: listing.seniority,
      roles,
      cities: profile.targetCities,
      countries: profile.targetCountries,
      profileSeniority: profile.seniority,
      passportScore: pool?.muqabalehScore,
      hasApplyEmail: Boolean(listing.applyEmail),
    });
    if (matchScore < 45) continue;

    const key = idempotency(userId, `listing:${listing.id}`);
    const existing = await db.jeannieOpportunity.findUnique({
      where: { idempotencyKey: key },
    });

    if (existing && TERMINAL.includes(existing.status)) {
      created.push(existing);
      if (created.length >= limit) break;
      continue;
    }

    const channel = listing.applyEmail ? 'EMAIL' : 'URL_PACKET';
    const row = await db.jeannieOpportunity.upsert({
      where: { idempotencyKey: key },
      create: {
        userId,
        status: JeannieOpportunityStatus.AWAITING_APPROVAL,
        listingId: listing.id,
        externalUrl: listing.applyUrl,
        applyEmail: listing.applyEmail,
        applyChannel: channel,
        companyName: listing.companyName,
        title: listing.title,
        titleAr: listing.title,
        city: listing.city,
        country: listing.country,
        matchScore,
        matchReason: listing.applyEmail
          ? `Strong target fit (score ${matchScore}). Jeannie can email your packet after you approve.`
          : `Target fit (score ${matchScore}). Jeannie will prepare a tracked apply packet after you approve.`,
        matchReasonAr: listing.applyEmail
          ? `ملاءمة قوية (درجة ${matchScore}). جيني ترسل حزمتك بالبريد بعد موافقتك.`
          : `ملاءمة لأهدافك (درجة ${matchScore}). جيني تجهّز حزمة تتبع بعد موافقتك.`,
        descriptionSnippet: listing.description?.slice(0, 500) || null,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        idempotencyKey: key,
      },
      update: {
        matchScore,
        companyName: listing.companyName,
        title: listing.title,
        city: listing.city,
        country: listing.country,
        externalUrl: listing.applyUrl,
        applyEmail: listing.applyEmail,
        applyChannel: channel,
        listingId: listing.id,
        descriptionSnippet: listing.description?.slice(0, 500) || null,
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

  return created.sort((a, b) => b.matchScore - a.matchScore);
}

async function listActiveShortlist(userId: string, limit: number) {
  return db.jeannieOpportunity.findMany({
    where: { userId },
    orderBy: [{ matchScore: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
}
