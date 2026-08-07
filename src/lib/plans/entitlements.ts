import { db } from '@/lib/db';
import { UserTier } from '@/lib/enums';

export type PlanKey = 'FREE' | 'JEANNIE' | 'JEANNIE_PRO' | 'MASTERY_PACK' | 'PRO' | 'UNLIMITED';

export type PlanEntitlements = {
  key: PlanKey;
  label: { en: string; ar: string };
  priceUsd: string;
  pricePeriod: 'free' | 'month' | 'once';
  /** Monthly mock interview allowance; null = unlimited */
  monthlyMocks: number | null;
  unlimitedPractice: boolean;
  fullPassport: boolean;
  /** Manual Kanban application tracker (candidate-owned CRM) */
  manualTracker: boolean;
  coverLetterAi: boolean;
  cvStudio: boolean;
  salaryBenchmarks: boolean;
  negotiationScripts: boolean;
  priorityEmployerRanking: boolean;
  topTenBadge: boolean;
  /** One-time Mastery Pack company-specific mock credits */
  masteryMocks: number;
};

/**
 * Prepare-and-Verify pricing (Aug 2026 pivot):
 * 1. Free — $0
 * 2. Jeannie — $14.99/mo
 * 3. Jeannie Pro — $29.99/mo
 * 4. Mastery Pack — $44.99 one-time
 *
 * No apply quotas. No apply-on-behalf.
 */
export const PLAN_ENTITLEMENTS: Record<PlanKey, PlanEntitlements> = {
  FREE: {
    key: 'FREE',
    label: { en: 'Basic', ar: 'أساسي' },
    priceUsd: '0',
    pricePeriod: 'free',
    monthlyMocks: 1,
    unlimitedPractice: false,
    fullPassport: false,
    manualTracker: false,
    coverLetterAi: false,
    cvStudio: false,
    salaryBenchmarks: false,
    negotiationScripts: false,
    priorityEmployerRanking: false,
    topTenBadge: false,
    masteryMocks: 0,
  },
  JEANNIE: {
    key: 'JEANNIE',
    label: { en: 'Jeannie', ar: 'جيني' },
    priceUsd: '14.99',
    pricePeriod: 'month',
    monthlyMocks: null,
    unlimitedPractice: true,
    fullPassport: true,
    manualTracker: true,
    coverLetterAi: true,
    cvStudio: false,
    salaryBenchmarks: true,
    negotiationScripts: false,
    priorityEmployerRanking: false,
    topTenBadge: false,
    masteryMocks: 0,
  },
  JEANNIE_PRO: {
    key: 'JEANNIE_PRO',
    label: { en: 'Jeannie Pro', ar: 'جيني برو' },
    priceUsd: '29.99',
    pricePeriod: 'month',
    monthlyMocks: null,
    unlimitedPractice: true,
    fullPassport: true,
    manualTracker: true,
    coverLetterAi: true,
    cvStudio: true,
    salaryBenchmarks: true,
    negotiationScripts: true,
    priorityEmployerRanking: true,
    topTenBadge: true,
    masteryMocks: 0,
  },
  MASTERY_PACK: {
    key: 'MASTERY_PACK',
    label: { en: 'Mastery Pack', ar: 'باقة الإتقان' },
    priceUsd: '44.99',
    pricePeriod: 'once',
    monthlyMocks: null,
    unlimitedPractice: false,
    fullPassport: true,
    manualTracker: false,
    coverLetterAi: false,
    cvStudio: false,
    salaryBenchmarks: false,
    negotiationScripts: true,
    priorityEmployerRanking: false,
    topTenBadge: false,
    masteryMocks: 5,
  },
  PRO: {
    key: 'PRO',
    label: { en: 'Pro (legacy)', ar: 'احترافي (قديم)' },
    priceUsd: '9.99',
    pricePeriod: 'once',
    monthlyMocks: 3,
    unlimitedPractice: false,
    fullPassport: true,
    manualTracker: false,
    coverLetterAi: false,
    cvStudio: false,
    salaryBenchmarks: false,
    negotiationScripts: false,
    priorityEmployerRanking: false,
    topTenBadge: false,
    masteryMocks: 0,
  },
  UNLIMITED: {
    key: 'UNLIMITED',
    label: { en: 'Unlimited (legacy)', ar: 'بلا حدود (قديم)' },
    priceUsd: '29.99',
    pricePeriod: 'month',
    monthlyMocks: null,
    unlimitedPractice: true,
    fullPassport: true,
    manualTracker: true,
    coverLetterAi: true,
    cvStudio: true,
    salaryBenchmarks: true,
    negotiationScripts: true,
    priorityEmployerRanking: true,
    topTenBadge: true,
    masteryMocks: 0,
  },
};

export function entitlementsForTier(tier: UserTier | string): PlanEntitlements {
  const key = String(tier) as PlanKey;
  return PLAN_ENTITLEMENTS[key] ?? PLAN_ENTITLEMENTS.FREE;
}

function monthFromNow(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

const PAID_SUB_TIERS = new Set<string>([
  UserTier.JEANNIE,
  UserTier.JEANNIE_PRO,
  UserTier.UNLIMITED,
]);

async function hasActivePaypalSubscription(userId: string): Promise<boolean> {
  const count = await db.paypalSubscription.count({
    where: { userId, status: 'ACTIVE' },
  });
  return count > 0;
}

/**
 * Keep subscription state fresh for paid monthly tiers.
 * Expired paid tiers without an active PayPal sub → revoke to Free.
 */
export async function ensureSubscriptionFresh(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tier: true,
      cvStudioEnabled: true,
      coverLetterAiEnabled: true,
      sessionsLeft: true,
      masteryMocksLeft: true,
      subscriptionExpiresAt: true,
    },
  });
  if (!user) return null;

  const now = new Date();
  const isPaidSub = PAID_SUB_TIERS.has(String(user.tier));

  if (isPaidSub) {
    const expired =
      user.subscriptionExpiresAt != null &&
      user.subscriptionExpiresAt.getTime() <= now.getTime();
    if (expired) {
      const activeSub = await hasActivePaypalSubscription(userId);
      if (!activeSub) {
        await revokeToFree(userId);
        return db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            tier: true,
            cvStudioEnabled: true,
            coverLetterAiEnabled: true,
            sessionsLeft: true,
            masteryMocksLeft: true,
            subscriptionExpiresAt: true,
          },
        });
      }
    }
  }

  return user;
}

/** @deprecated Use ensureSubscriptionFresh — apply quotas removed in Prepare-and-Verify pivot. */
export const ensureApplyQuotaFresh = ensureSubscriptionFresh;

export async function getEntitlementSnapshot(userId: string) {
  const user = await ensureSubscriptionFresh(userId);
  if (!user) return null;
  const ent = entitlementsForTier(user.tier);
  const canPractice =
    ent.unlimitedPractice ||
    user.sessionsLeft > 0 ||
    user.masteryMocksLeft > 0;
  return {
    tier: user.tier,
    plan: ent,
    sessionsLeft: user.sessionsLeft,
    masteryMocksLeft: user.masteryMocksLeft,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    cvStudioEnabled: user.cvStudioEnabled || ent.cvStudio,
    coverLetterAiEnabled: user.coverLetterAiEnabled || ent.coverLetterAi,
    canPractice,
    canUseJeannie: ent.key === 'JEANNIE' || ent.key === 'JEANNIE_PRO' || ent.key === 'UNLIMITED',
    manualTracker: ent.manualTracker,
    salaryBenchmarks: ent.salaryBenchmarks,
    negotiationScripts: ent.negotiationScripts,
    cvUpload: ent.cvStudio || ent.coverLetterAi,
    coverLetterUpload: ent.coverLetterAi,
    /** Removed — always false (no apply-on-behalf). */
    canApply: false,
    appliesLeft: 0,
    tracker: ent.manualTracker ? ('full' as const) : ('none' as const),
  };
}

export async function canPractice(userId: string): Promise<boolean> {
  const snap = await getEntitlementSnapshot(userId);
  return !!snap?.canPractice;
}

export async function canUseCvStudio(userId: string): Promise<boolean> {
  const snap = await getEntitlementSnapshot(userId);
  return !!snap?.cvStudioEnabled;
}

export async function canUseCoverLetterAi(userId: string): Promise<boolean> {
  const snap = await getEntitlementSnapshot(userId);
  return !!snap?.coverLetterAiEnabled;
}

/**
 * Debit one practice session unless the plan has unlimited practice.
 * Mastery Pack credits debit masteryMocksLeft first for company-specific mocks when flagged.
 */
export async function debitPractice(
  userId: string,
  opts?: { alreadyDebited?: boolean; useMasteryCredit?: boolean },
): Promise<
  | { ok: true; sessionsLeft: number; unlimited: boolean; debited: boolean }
  | { ok: false; error: string; status: number }
> {
  if (opts?.alreadyDebited) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { sessionsLeft: true, tier: true },
    });
    if (!user) return { ok: false, error: 'User not found', status: 404 };
    const ent = entitlementsForTier(user.tier);
    return {
      ok: true,
      sessionsLeft: user.sessionsLeft,
      unlimited: ent.unlimitedPractice,
      debited: false,
    };
  }

  const snap = await getEntitlementSnapshot(userId);
  if (!snap) return { ok: false, error: 'User not found', status: 404 };

  if (opts?.useMasteryCredit && snap.masteryMocksLeft > 0) {
    const updated = await db.user.updateMany({
      where: { id: userId, masteryMocksLeft: { gt: 0 } },
      data: { masteryMocksLeft: { decrement: 1 } },
    });
    if (updated.count === 0) {
      return { ok: false, error: 'No Mastery Pack mocks left', status: 402 };
    }
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { sessionsLeft: true },
    });
    return {
      ok: true,
      sessionsLeft: user?.sessionsLeft ?? 0,
      unlimited: false,
      debited: true,
    };
  }

  if (snap.plan.unlimitedPractice) {
    return {
      ok: true,
      sessionsLeft: snap.sessionsLeft,
      unlimited: true,
      debited: false,
    };
  }

  if (snap.sessionsLeft <= 0) {
    return {
      ok: false,
      error: 'No practice sessions left — upgrade to keep practicing',
      status: 402,
    };
  }

  const updated = await db.user.updateMany({
    where: { id: userId, sessionsLeft: { gt: 0 } },
    data: { sessionsLeft: { decrement: 1 } },
  });
  if (updated.count === 0) {
    return {
      ok: false,
      error: 'No practice sessions left — upgrade to keep practicing',
      status: 402,
    };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { sessionsLeft: true },
  });
  return {
    ok: true,
    sessionsLeft: user?.sessionsLeft ?? 0,
    unlimited: false,
    debited: true,
  };
}

export type GrantPlanInput = {
  userId: string;
  planKey: PlanKey;
  sessions?: number;
  /** Billing period end; defaults to +1 month for subscriptions. */
  expiresAt?: Date | null;
};

/** Grant plan entitlements after successful payment / activation. */
export async function grantPlan({
  userId,
  planKey,
  sessions,
  expiresAt,
}: GrantPlanInput) {
  const ent = PLAN_ENTITLEMENTS[planKey] ?? PLAN_ENTITLEMENTS.FREE;
  const tier =
    planKey === 'JEANNIE'
      ? UserTier.JEANNIE
      : planKey === 'JEANNIE_PRO'
        ? UserTier.JEANNIE_PRO
        : planKey === 'MASTERY_PACK'
          ? UserTier.MASTERY_PACK
          : planKey === 'UNLIMITED'
            ? UserTier.UNLIMITED
            : planKey === 'PRO'
              ? UserTier.PRO
              : UserTier.FREE;

  if (planKey === 'PRO') {
    const add = sessions ?? 3;
    return db.user.update({
      where: { id: userId },
      data: {
        tier,
        sessionsLeft: { increment: add },
        cvStudioEnabled: false,
        coverLetterAiEnabled: false,
        subscriptionExpiresAt: null,
      },
    });
  }

  if (planKey === 'MASTERY_PACK') {
    return db.user.update({
      where: { id: userId },
      data: {
        // Keep existing subscription tier if already on Jeannie; otherwise tag Mastery.
        // One-time pack adds mock credits + negotiation access flags via masteryMocksLeft.
        masteryMocksLeft: { increment: ent.masteryMocks },
        coverLetterAiEnabled: true,
      },
    });
  }

  const periodEnd =
    expiresAt === undefined
      ? ent.pricePeriod === 'month'
        ? monthFromNow()
        : null
      : expiresAt;

  return db.user.update({
    where: { id: userId },
    data: {
      tier,
      sessionsLeft: sessions ?? (ent.unlimitedPractice ? 999 : ent.monthlyMocks ?? 1),
      cvStudioEnabled: ent.cvStudio,
      coverLetterAiEnabled: ent.coverLetterAi,
      subscriptionExpiresAt: periodEnd,
    },
  });
}

export async function revokeToFree(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      tier: UserTier.FREE,
      sessionsLeft: 1,
      cvStudioEnabled: false,
      coverLetterAiEnabled: false,
      subscriptionExpiresAt: null,
    },
  });
}
