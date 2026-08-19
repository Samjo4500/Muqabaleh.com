import { db } from '@/lib/db';
import { isMissingRelationError } from './eligibility';

/** Remove unused pack credits after 30 days. Safe if the table is missing. */
export async function expireStudent100Pack(userId: string): Promise<void> {
  try {
    const claim = await db.student100Claim.findUnique({ where: { userId } });
    if (!claim || claim.status !== 'ACTIVATED' || !claim.expiresAt) return;
    if (claim.expiresAt.getTime() > Date.now()) return;

    const take = Math.max(0, claim.creditsRemaining);
    if (take > 0) {
      await db.$executeRaw`
        UPDATE "User"
        SET "sessionsLeft" = GREATEST(0, "sessionsLeft" - ${take})
        WHERE "id" = ${userId}
      `;
    }
    await db.student100Claim.update({
      where: { id: claim.id },
      data: { creditsRemaining: 0, status: 'EXPIRED' },
    });
  } catch (err) {
    if (isMissingRelationError(err)) return;
    console.error('expireStudent100Pack', err);
  }
}

/** After a billed practice debit, consume one pack credit if the pack is still active. */
export async function consumeStudent100Credit(userId: string): Promise<void> {
  try {
    await db.student100Claim.updateMany({
      where: {
        userId,
        status: 'ACTIVATED',
        creditsRemaining: { gt: 0 },
        expiresAt: { gt: new Date() },
      },
      data: { creditsRemaining: { decrement: 1 } },
    });
  } catch (err) {
    if (isMissingRelationError(err)) return;
  }
}
