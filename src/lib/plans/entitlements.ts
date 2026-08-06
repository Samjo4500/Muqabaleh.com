import { db } from '@/lib/db';
import { UserTier } from '@/lib/enums';

export type PlanKey = 'FREE' | 'JEANNIE' | 'JEANNIE_PRO' | 'PRO' | 'UNLIMITED';

export type PlanEntitlements = {
  key: PlanKey;
  label: { en: string; ar: string };
  monthlyApplies: number;
  unlimitedPractice: boolean;
  fullPassport: boolean;
  cvUpload: boolean;
  coverLetterUpload: boolean;
  cvStudio: boolean;
  coverLetterAi: boolean;
  tracker: 'none' | 'standard' | 'full';
  notSpamApproveGate: boolean;
};

export const PLAN_ENTITLEMENTS: Record<PlanKey, PlanEntitlements> = {
  FREE: {
    key: 'FREE',
    label: { en: 'Free', ar: 'مجاني' },
    monthlyApplies: 0,
    unlimitedPractice: false,
    fullPassport: true,
    cvUpload: false,
    coverLetterUpload: false,
    cvStudio: false,
    coverLetterAi: false,
    tracker: 'none',
    notSpamApproveGate: false,
  },
  PRO: {
    // Legacy pack — treat as practice-only bridge
    key: 'PRO',
    label: { en: 'Pro (legacy)', ar: 'احترافي (قديم)' },
    monthlyApplies: 0,
    unlimitedPractice: false,
    fullPassport: true,
    cvUpload: false,
    coverLetterUpload: false,
    cvStudio: false,
    coverLetterAi: false,
    tracker: 'none',
    notSpamApproveGate: false,
  },
  UNLIMITED: {
    // Legacy unlimited — map to Jeannie Pro-like practice until migrated
    key: 'UNLIMITED',
    label: { en: 'Unlimited (legacy)', ar: 'بلا حدود (قديم)' },
    monthlyApplies: 20,
    unlimitedPractice: true,
    fullPassport: true,
    cvUpload: true,
    coverLetterUpload: true,
    cvStudio: true,
    coverLetterAi: true,
    tracker: 'full',
    notSpamApproveGate: true,
  },
  JEANNIE: {
    key: 'JEANNIE',
    label: { en: 'Jeannie', ar: 'جيني' },
    monthlyApplies: 10,
    unlimitedPractice: true,
    fullPassport: true,
    cvUpload: true,
    coverLetterUpload: true,
    cvStudio: false,
    coverLetterAi: false,
    tracker: 'standard',
    notSpamApproveGate: true,
  },
  JEANNIE_PRO: {
    key: 'JEANNIE_PRO',
    label: { en: 'Jeannie Pro', ar: 'جيني برو' },
    monthlyApplies: 20,
    unlimitedPractice: true,
    fullPassport: true,
    cvUpload: true,
    coverLetterUpload: true,
    cvStudio: true,
    coverLetterAi: true,
    tracker: 'full',
    notSpamApproveGate: true,
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

function addMonths(from: Date, months = 1): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

const PAID_APPLY_TIERS = new Set<string>([
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
 * Keep apply quota in sync with billing period.
 * - Expired paid tiers without an active PayPal sub → revoke to Free
 * - Monthly reset only while the paid period is still valid
 */
export async function ensureApplyQuotaFresh(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tier: true,
      appliesLeft: true,
      appliesResetAt: true,
      cvStudioEnabled: true,
      coverLetterAiEnabled: true,
      sessionsLeft: true,
      subscriptionExpiresAt: true,
    },
  });
  if (!user) return null;

  const now = new Date();
  const isPaidApplyTier = PAID_APPLY_TIERS.has(String(user.tier));

  if (isPaidApplyTier) {
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
            appliesLeft: true,
            appliesResetAt: true,
            cvStudioEnabled: true,
            coverLetterAiEnabled: true,
            sessionsLeft: true,
            subscriptionExpiresAt: true,
          },
        });
      }
    }
  }

  const ent = entitlementsForTier(user.tier);
  const periodValid =
    !isPaidApplyTier ||
    (user.subscriptionExpiresAt != null &&
      user.subscriptionExpiresAt.getTime() > now.getTime()) ||
    (await hasActivePaypalSubscription(userId));

  const needsReset =
    ent.monthlyApplies > 0 &&
    periodValid &&
    (!user.appliesResetAt || user.appliesResetAt.getTime() <= now.getTime());

  if (!needsReset) return user;

  const resetFrom =
    user.appliesResetAt && user.appliesResetAt.getTime() <= now.getTime()
      ? user.appliesResetAt
      : now;

  return db.user.update({
    where: { id: userId },
    data: {
      appliesLeft: ent.monthlyApplies,
      appliesResetAt: addMonths(resetFrom, 1),
      cvStudioEnabled: ent.cvStudio,
      coverLetterAiEnabled: ent.coverLetterAi,
    },
    select: {
      id: true,
      tier: true,
      appliesLeft: true,
      appliesResetAt: true,
      cvStudioEnabled: true,
      coverLetterAiEnabled: true,
      sessionsLeft: true,
      subscriptionExpiresAt: true,
    },
  });
}

export async function getEntitlementSnapshot(userId: string) {
  const user = await ensureApplyQuotaFresh(userId);
  if (!user) return null;
  const ent = entitlementsForTier(user.tier);
  return {
    tier: user.tier,
    plan: ent,
    sessionsLeft: user.sessionsLeft,
    appliesLeft: user.appliesLeft,
    appliesResetAt: user.appliesResetAt,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    cvStudioEnabled: user.cvStudioEnabled || ent.cvStudio,
    coverLetterAiEnabled: user.coverLetterAiEnabled || ent.coverLetterAi,
    canPractice: ent.unlimitedPractice || user.sessionsLeft > 0,
    canUseJeannie: ent.monthlyApplies > 0,
    canApply: ent.monthlyApplies > 0 && user.appliesLeft > 0,
    cvUpload: ent.cvUpload,
    coverLetterUpload: ent.coverLetterUpload,
    tracker: ent.tracker,
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

export async function assertCanApply(userId: string): Promise<
  | { ok: true; appliesLeft: number }
  | { ok: false; error: string; status: number }
> {
  const snap = await getEntitlementSnapshot(userId);
  if (!snap) return { ok: false, error: 'User not found', status: 404 };
  if (!snap.canUseJeannie) {
    return {
      ok: false,
      error: 'Jeannie applies require a Jeannie plan',
      status: 403,
    };
  }
  if (snap.appliesLeft <= 0) {
    return {
      ok: false,
      error: 'Monthly apply quota exhausted',
      status: 402,
    };
  }
  return { ok: true, appliesLeft: snap.appliesLeft };
}

/**
 * Atomic apply debit — only succeeds when appliesLeft > 0.
 * Safe under concurrent requests.
 */
export async function debitApply(userId: string) {
  const gate = await assertCanApply(userId);
  if (!gate.ok) return gate;

  const updated = await db.user.updateMany({
    where: { id: userId, appliesLeft: { gt: 0 } },
    data: { appliesLeft: { decrement: 1 } },
  });
  if (updated.count === 0) {
    return {
      ok: false as const,
      error: 'Monthly apply quota exhausted',
      status: 402,
    };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { appliesLeft: true },
  });
  return { ok: true as const, appliesLeft: user?.appliesLeft ?? 0 };
}

/**
 * Debit one practice session unless the plan has unlimited practice.
 * Idempotent when `alreadyDebited` is true for the session.
 */
export async function debitPractice(
  userId: string,
  opts?: { alreadyDebited?: boolean },
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
  /** Billing period end; defaults to +1 month for apply plans. */
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
        appliesLeft: 0,
        appliesResetAt: null,
        cvStudioEnabled: false,
        coverLetterAiEnabled: false,
        subscriptionExpiresAt: null,
      },
    });
  }

  const periodEnd =
    expiresAt === undefined
      ? ent.monthlyApplies > 0
        ? monthFromNow()
        : null
      : expiresAt;

  return db.user.update({
    where: { id: userId },
    data: {
      tier,
      sessionsLeft: sessions ?? (ent.unlimitedPractice ? 999 : 1),
      appliesLeft: ent.monthlyApplies,
      appliesResetAt: ent.monthlyApplies > 0 ? monthFromNow() : null,
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
      appliesLeft: 0,
      appliesResetAt: null,
      cvStudioEnabled: false,
      coverLetterAiEnabled: false,
      subscriptionExpiresAt: null,
    },
  });
}
