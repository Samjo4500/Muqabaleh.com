import { db } from '@/lib/db';

export type CoachFunnelEvent =
  | 'coach.prep_ready'
  | 'coach.session_start'
  | 'coach.session_resume'
  | 'coach.turn'
  | 'coach.complete'
  | 'coach.complete_blocked'
  | 'coach.passport_download'
  | 'coach.quota_blocked'
  | 'coach.integrity_signal';

/**
 * Funnel analytics for prep → finish → passport.
 * Best-effort AuditLog write — never throws.
 */
export async function trackCoachEvent(
  userId: string | undefined,
  event: CoachFunnelEvent,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: userId || null,
        event,
        metadata: JSON.stringify({
          funnel: 'jeannie-coach',
          at: new Date().toISOString(),
          ...metadata,
        }),
      },
    });
  } catch {
    /* never block interview flow */
  }
}
