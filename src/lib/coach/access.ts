import { db } from '@/lib/db';
import { getInterviewConfig } from './config';
import type { AccessGate, AccessTierLabel } from './types';

export type CoachAccessSnapshot = {
  tier: string;
  gateLabel: AccessTierLabel;
  gate: AccessGate;
  completedLifetime: number;
  completedThisMonth: number;
  canStart: boolean;
  remaining: number | null;
  reason?: string;
  /** Active in-progress coach session, if any (resume without burning a new quota slot). */
  activeSessionId?: string | null;
  canResume?: boolean;
};

function gateLabelForTier(tier: string): AccessTierLabel {
  const map = getInterviewConfig().tierMap;
  return map[String(tier).toUpperCase()] || map[tier] || 'Free';
}

async function countCompletedSafe(
  userId: string,
  since?: Date,
): Promise<number> {
  try {
    return await db.interviewSession.count({
      where: {
        userId,
        status: 'completed',
        ...(since ? { completedAt: { gte: since } } : {}),
      },
    });
  } catch (err) {
    console.error('[coach/access] count failed', err);
    return 0;
  }
}

async function findActiveCoachSessionId(userId: string): Promise<string | null> {
  try {
    const rows = await db.interviewSession.findMany({
      where: {
        userId,
        status: { in: ['active', 'pending'] },
      },
      select: { id: true, fullReport: true, prequal: { select: { generatedPlan: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 8,
    });
    for (const row of rows) {
      const fr = row.fullReport as { engine?: string } | null;
      const gp = row.prequal.generatedPlan as { engine?: string } | null;
      if (fr?.engine === 'jeannie-coach' || gp?.engine === 'jeannie-coach') {
        return row.id;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCoachAccess(userId: string): Promise<CoachAccessSnapshot> {
  const cfg = getInterviewConfig();
  let tier = 'FREE';
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { tier: true, sessionsLeft: true },
    });
    if (user?.tier) tier = String(user.tier);
  } catch (err) {
    console.error('[coach/access] user lookup failed', err);
  }

  const gateLabel = gateLabelForTier(tier);
  const gate = cfg.accessGates[gateLabel] || cfg.accessGates.Free;
  const activeSessionId = await findActiveCoachSessionId(userId);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const completedLifetime = await countCompletedSafe(userId);
  const completedThisMonth = await countCompletedSafe(userId, monthStart);

  const withActive = (
    base: Omit<CoachAccessSnapshot, 'activeSessionId' | 'canResume'>,
  ): CoachAccessSnapshot => ({
    ...base,
    activeSessionId,
    canResume: !!activeSessionId,
  });

  if (gate.maxInterviews == null || gate.period === 'unlimited') {
    return withActive({
      tier,
      gateLabel,
      gate,
      completedLifetime,
      completedThisMonth,
      canStart: true,
      remaining: null,
    });
  }

  if (gate.period === 'lifetime') {
    const remaining = Math.max(0, gate.maxInterviews - completedLifetime);
    return withActive({
      tier,
      gateLabel,
      gate,
      completedLifetime,
      completedThisMonth,
      canStart: remaining > 0,
      remaining,
      reason:
        remaining <= 0
          ? 'Free tier includes 1 mock interview. Upgrade to unlock more.'
          : undefined,
    });
  }

  // monthly
  const remaining = Math.max(0, gate.maxInterviews - completedThisMonth);
  return withActive({
    tier,
    gateLabel,
    gate,
    completedLifetime,
    completedThisMonth,
    canStart: remaining > 0,
    remaining,
    reason:
      remaining <= 0
        ? 'Monthly interview limit reached. Upgrade or wait until next month.'
        : undefined,
  });
}
