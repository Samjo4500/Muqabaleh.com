/**
 * Helpers to persist seeker work preferences on CandidatePool + JeannieProfile.
 */

import { db } from '@/lib/db';
import {
  parseWorkPreferences,
  serializeWorkPreferences,
  type WorkPreferenceCode,
} from '@/lib/constants';
import { updateJeannieProfile } from '@/lib/jeannie/profile';

export function normalizeWorkPreferencesInput(
  raw: unknown,
): WorkPreferenceCode[] {
  if (Array.isArray(raw)) return parseWorkPreferences(raw.map(String));
  if (typeof raw === 'string') return parseWorkPreferences(raw);
  return [];
}

/** Ensure CandidatePool.workPreferences column exists (safe if migrate lagged). */
export async function ensureWorkPreferencesColumn(): Promise<void> {
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE "CandidatePool" ADD COLUMN IF NOT EXISTS "workPreferences" TEXT`,
    );
  } catch {
    /* ignore — column may already exist or table missing in demo */
  }
}

export async function syncWorkPreferences(
  userId: string,
  prefs: WorkPreferenceCode[] | string[] | string | null | undefined,
): Promise<string | null> {
  const parsed = normalizeWorkPreferencesInput(prefs);
  const serialized = serializeWorkPreferences(parsed);
  await ensureWorkPreferencesColumn();

  // Mirror to Jeannie targets (no-op create if missing)
  try {
    await updateJeannieProfile(userId, { workModes: parsed });
  } catch {
    /* Jeannie profile optional */
  }

  return serialized;
}
