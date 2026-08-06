import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { JeannieOpportunityStatus, JeannieSlaStatus, UserTier } from '@prisma/client';
import { verifyAdmin } from '@/app/api/admin/_lib';

/** Super-admin Jeannie ops overview */
export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const [
    subscribers,
    activeSla,
    awaitingApproval,
    appliedThisWeek,
    failed,
    listings,
    recentOpps,
    slaAtRisk,
  ] = await Promise.all([
    db.user.count({
      where: { tier: { in: [UserTier.JEANNIE, UserTier.JEANNIE_PRO, UserTier.UNLIMITED] } },
    }),
    db.jeannieSlaPeriod.count({ where: { status: JeannieSlaStatus.ACTIVE } }),
    db.jeannieOpportunity.count({
      where: { status: JeannieOpportunityStatus.AWAITING_APPROVAL },
    }),
    db.jeannieOpportunity.count({
      where: {
        status: JeannieOpportunityStatus.APPLIED,
        appliedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    db.jeannieOpportunity.count({ where: { status: JeannieOpportunityStatus.FAILED } }),
    db.jeannieJobListing.count({ where: { isActive: true } }),
    db.jeannieOpportunity.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 40,
      select: {
        id: true,
        status: true,
        title: true,
        companyName: true,
        applyChannel: true,
        applyEmail: true,
        matchScore: true,
        appliedAt: true,
        failureReason: true,
        user: { select: { id: true, email: true, name: true, tier: true } },
      },
    }),
    db.jeannieSlaPeriod.findMany({
      where: { status: JeannieSlaStatus.ACTIVE },
      orderBy: { periodEnd: 'asc' },
      take: 40,
      include: {
        user: { select: { id: true, email: true, name: true, tier: true, appliesLeft: true } },
      },
    }),
  ]);

  return NextResponse.json({
    stats: {
      subscribers,
      activeSla,
      awaitingApproval,
      appliedThisWeek,
      failed,
      listings,
    },
    recentOpps,
    slaAtRisk: slaAtRisk.map((p) => ({
      id: p.id,
      email: p.user.email,
      name: p.user.name,
      tier: p.user.tier,
      promised: p.promisedApplies,
      delivered: p.deliveredApplies,
      remaining: Math.max(0, p.promisedApplies - p.deliveredApplies),
      rolledIn: p.rolledInApplies,
      periodEnd: p.periodEnd,
      appliesLeft: p.user.appliesLeft,
    })),
  });
}
