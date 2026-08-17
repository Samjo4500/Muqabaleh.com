import { db } from '@/lib/db';
import type { NurtureFrequency } from './constants';

export async function loadPrefByToken(token: string) {
  if (!token || token.length < 8) return null;
  return db.nurturePreference.findUnique({
    where: { token },
    include: {
      lead: {
        select: {
          id: true,
          email: true,
          fullName: true,
          preferredLanguage: true,
        },
      },
    },
  });
}

export async function applyPreference(
  token: string,
  action: 'LESS_OFTEN' | 'PAUSE_30' | 'UNSUBSCRIBE' | 'RESUME',
) {
  const pref = await loadPrefByToken(token);
  if (!pref) return null;

  const now = new Date();
  let frequency: NurtureFrequency = 'NORMAL';
  let pausedUntil: Date | null = null;
  let unsubscribedAt: Date | null = null;

  if (action === 'LESS_OFTEN') frequency = 'LESS_OFTEN';
  if (action === 'PAUSE_30') {
    frequency = 'PAUSED';
    pausedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  if (action === 'UNSUBSCRIBE') {
    frequency = 'UNSUBSCRIBED';
    unsubscribedAt = now;
  }
  if (action === 'RESUME') {
    frequency = 'NORMAL';
    pausedUntil = null;
    unsubscribedAt = null;
  }

  const updated = await db.nurturePreference.update({
    where: { id: pref.id },
    data: { frequency, pausedUntil, unsubscribedAt },
    include: { lead: { select: { preferredLanguage: true, email: true, fullName: true } } },
  });

  if (action === 'UNSUBSCRIBE') {
    await db.nurtureEnrollment.updateMany({
      where: { leadId: pref.leadId, status: 'ACTIVE' },
      data: { status: 'PAUSED' },
    });
  }

  return updated;
}
