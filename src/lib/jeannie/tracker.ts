import { db } from '@/lib/db';
import { getEntitlementSnapshot } from '@/lib/plans/entitlements';

export type TrackerItem = {
  id: string;
  kind: 'opportunity' | 'application';
  status: string;
  companyName: string;
  title: string;
  city?: string | null;
  country?: string | null;
  matchScore?: number | null;
  source?: string | null;
  stage?: string | null;
  passportVerificationId?: string | null;
  appliedAt?: string | null;
  updatedAt: string;
  failureReason?: string | null;
};

export type TrackerInsights = {
  suggested: number;
  awaitingApproval: number;
  approved: number;
  packetReady: number;
  applied: number;
  rejected: number;
  failed: number;
  expired: number;
  avgMatchScore: number | null;
  conversionApproveToApply: number | null;
};

export async function getJeannieTracker(userId: string) {
  const snap = await getEntitlementSnapshot(userId);
  if (!snap) return null;

  const opportunities = await db.jeannieOpportunity.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  const applications = await db.jobApplication.findMany({
    where: { candidateId: userId, source: 'JEANNIE' },
    include: {
      job: {
        select: {
          title: true,
          city: true,
          country: true,
          company: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  const items: TrackerItem[] = [
    ...opportunities.map((o) => ({
      id: o.id,
      kind: 'opportunity' as const,
      status: o.status,
      companyName: o.companyName,
      title: o.title,
      city: o.city,
      country: o.country,
      matchScore: o.matchScore,
      source: o.b2bJobId ? 'INTERNAL' : 'EXTERNAL_PACKET',
      passportVerificationId: o.passportVerificationId,
      appliedAt: o.appliedAt?.toISOString() ?? null,
      updatedAt: o.updatedAt.toISOString(),
      failureReason: o.failureReason,
    })),
    ...applications.map((a) => ({
      id: a.id,
      kind: 'application' as const,
      status: a.stage,
      companyName: a.job.company?.name || 'Company',
      title: a.job.title,
      city: a.job.city,
      country: a.job.country,
      matchScore: a.score,
      source: a.source,
      stage: a.stage,
      appliedAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
  ].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  const counts = {
    suggested: 0,
    awaitingApproval: 0,
    approved: 0,
    packetReady: 0,
    applied: 0,
    rejected: 0,
    failed: 0,
    expired: 0,
  };
  let scoreSum = 0;
  let scoreN = 0;
  for (const o of opportunities) {
    scoreSum += o.matchScore;
    scoreN += 1;
    switch (o.status) {
      case 'SUGGESTED':
        counts.suggested += 1;
        break;
      case 'AWAITING_APPROVAL':
        counts.awaitingApproval += 1;
        break;
      case 'APPROVED':
      case 'APPLYING':
        counts.approved += 1;
        break;
      case 'PACKET_READY':
        counts.packetReady += 1;
        break;
      case 'APPLIED':
        counts.applied += 1;
        break;
      case 'REJECTED_BY_USER':
        counts.rejected += 1;
        break;
      case 'FAILED':
        counts.failed += 1;
        break;
      case 'EXPIRED':
        counts.expired += 1;
        break;
      default:
        break;
    }
  }

  const approvedLike = counts.approved + counts.packetReady + counts.applied;
  const insights: TrackerInsights | null =
    snap.tracker === 'full'
      ? {
          ...counts,
          avgMatchScore: scoreN ? Math.round(scoreSum / scoreN) : null,
          conversionApproveToApply:
            approvedLike > 0
              ? Math.round((counts.applied / approvedLike) * 100)
              : null,
        }
      : null;

  return {
    tracker: snap.tracker,
    items: snap.tracker === 'none' ? [] : items,
    insights,
    entitlements: {
      tier: snap.tier,
      appliesLeft: snap.appliesLeft,
      monthlyApplies: snap.plan.monthlyApplies,
    },
  };
}
