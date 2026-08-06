import { db } from '@/lib/db';
import { JeannieSlaStatus, UserTier } from '@prisma/client';
import { entitlementsForTier } from '@/lib/plans/entitlements';

const APPLY_TIERS = new Set<string>([
  UserTier.JEANNIE,
  UserTier.JEANNIE_PRO,
  UserTier.UNLIMITED,
]);

function addMonths(from: Date, months = 1) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

async function closeAndMeasureUnmet(periodId: string, promised: number, delivered: number) {
  const unmet = Math.max(0, promised - delivered);
  await db.jeannieSlaPeriod.update({
    where: { id: periodId },
    data: {
      status: unmet > 0 ? JeannieSlaStatus.ROLLED_OVER : JeannieSlaStatus.FULFILLED,
      rolledOutApplies: unmet,
    },
  });
  return unmet;
}

/** Ensure an ACTIVE SLA period exists for a Jeannie subscriber. */
export async function ensureActiveSlaPeriod(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tier: true,
      appliesResetAt: true,
      subscriptionExpiresAt: true,
    },
  });
  if (!user || !APPLY_TIERS.has(String(user.tier))) return null;

  const ent = entitlementsForTier(user.tier);
  if (ent.monthlyApplies <= 0) return null;

  const existing = await db.jeannieSlaPeriod.findFirst({
    where: { userId, status: JeannieSlaStatus.ACTIVE },
    orderBy: { periodStart: 'desc' },
  });
  if (existing && existing.periodEnd.getTime() > Date.now()) {
    return existing;
  }

  let rolledIn = 0;
  if (existing) {
    rolledIn = await closeAndMeasureUnmet(
      existing.id,
      existing.promisedApplies,
      existing.deliveredApplies,
    );
  }

  const periodStart = new Date();
  const periodEnd =
    user.appliesResetAt && user.appliesResetAt.getTime() > Date.now()
      ? user.appliesResetAt
      : user.subscriptionExpiresAt && user.subscriptionExpiresAt.getTime() > Date.now()
        ? user.subscriptionExpiresAt
        : addMonths(periodStart, 1);

  const promised = ent.monthlyApplies + rolledIn;

  await db.user.update({
    where: { id: userId },
    data: {
      appliesLeft: promised,
      appliesResetAt: periodEnd,
    },
  });

  return db.jeannieSlaPeriod.create({
    data: {
      userId,
      periodStart,
      periodEnd,
      promisedApplies: promised,
      deliveredApplies: 0,
      rolledInApplies: rolledIn,
      status: JeannieSlaStatus.ACTIVE,
    },
  });
}

/** Open / refresh SLA when a plan is granted. */
export async function openSlaPeriodForGrant(
  userId: string,
  promisedApplies: number,
  periodEnd: Date,
) {
  if (promisedApplies <= 0) return null;

  const active = await db.jeannieSlaPeriod.findFirst({
    where: { userId, status: JeannieSlaStatus.ACTIVE },
    orderBy: { periodStart: 'desc' },
  });

  let rolledIn = 0;
  if (active) {
    rolledIn = await closeAndMeasureUnmet(
      active.id,
      active.promisedApplies,
      active.deliveredApplies,
    );
  }

  const promised = promisedApplies + rolledIn;
  return db.jeannieSlaPeriod.create({
    data: {
      userId,
      periodStart: new Date(),
      periodEnd,
      promisedApplies: promised,
      deliveredApplies: 0,
      rolledInApplies: rolledIn,
      status: JeannieSlaStatus.ACTIVE,
    },
  });
}

/** Count a successful employer delivery toward the promise. */
export async function recordDeliveredApply(userId: string) {
  const period = await ensureActiveSlaPeriod(userId);
  if (!period) return null;

  const nextDelivered = period.deliveredApplies + 1;
  return db.jeannieSlaPeriod.update({
    where: { id: period.id },
    data: {
      deliveredApplies: { increment: 1 },
      status:
        nextDelivered >= period.promisedApplies
          ? JeannieSlaStatus.FULFILLED
          : JeannieSlaStatus.ACTIVE,
    },
  });
}

export async function getSlaSnapshot(userId: string) {
  await ensureActiveSlaPeriod(userId);
  const period = await db.jeannieSlaPeriod.findFirst({
    where: {
      userId,
      status: { in: [JeannieSlaStatus.ACTIVE, JeannieSlaStatus.FULFILLED] },
    },
    orderBy: { periodStart: 'desc' },
  });
  if (!period) {
    return {
      promised: 0,
      delivered: 0,
      remaining: 0,
      periodEnd: null as Date | null,
      status: null as string | null,
      rolledIn: 0,
    };
  }
  return {
    promised: period.promisedApplies,
    delivered: period.deliveredApplies,
    remaining: Math.max(0, period.promisedApplies - period.deliveredApplies),
    periodEnd: period.periodEnd,
    status: period.status,
    rolledIn: period.rolledInApplies,
  };
}

/**
 * Close expired periods and roll unmet applies into the next cycle.
 * Guarantees we never silently break the monthly promise.
 */
export async function processExpiredSlaPeriods() {
  const now = new Date();
  const expired = await db.jeannieSlaPeriod.findMany({
    where: {
      status: JeannieSlaStatus.ACTIVE,
      periodEnd: { lte: now },
    },
    take: 200,
  });

  let rolled = 0;
  for (const period of expired) {
    const unmet = await closeAndMeasureUnmet(
      period.id,
      period.promisedApplies,
      period.deliveredApplies,
    );
    if (unmet <= 0) continue;

    const user = await db.user.findUnique({
      where: { id: period.userId },
      select: { tier: true, subscriptionExpiresAt: true },
    });
    if (!user || !APPLY_TIERS.has(String(user.tier))) continue;

    const ent = entitlementsForTier(user.tier);
    const periodEnd =
      user.subscriptionExpiresAt && user.subscriptionExpiresAt.getTime() > Date.now()
        ? user.subscriptionExpiresAt
        : addMonths(now, 1);
    const promised = ent.monthlyApplies + unmet;

    await db.jeannieSlaPeriod.create({
      data: {
        userId: period.userId,
        periodStart: now,
        periodEnd,
        promisedApplies: promised,
        deliveredApplies: 0,
        rolledInApplies: unmet,
        status: JeannieSlaStatus.ACTIVE,
      },
    });
    await db.user.update({
      where: { id: period.userId },
      data: {
        appliesLeft: promised,
        appliesResetAt: periodEnd,
      },
    });
    rolled += 1;
  }

  return { expired: expired.length, rolled };
}
