import { db } from '@/lib/db';
import { JeannieOpportunityStatus, UserTier } from '@prisma/client';
import { sendEmail, queueEmail } from '@/lib/email';
import { jeannieApprovalDigestEmail } from '@/emails/jeannie-approval-digest';
import { generateShortlist } from './match';
import { ensureActiveSlaPeriod, getSlaSnapshot, processExpiredSlaPeriods } from './sla';
import { signJeannieActionToken } from './tokens';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://muqabaleh.com';
const APPLY_TIERS = [UserTier.JEANNIE, UserTier.JEANNIE_PRO, UserTier.UNLIMITED];

/**
 * Full Jeannie ops tick:
 * 1) Roll unmet SLA promises forward
 * 2) Refresh shortlists for active subscribers
 * 3) Email approval digests for pending opportunities
 */
export async function runJeannieOpsTick(opts?: { digestOnly?: boolean }) {
  const sla = await processExpiredSlaPeriods();

  const subscribers = await db.user.findMany({
    where: {
      tier: { in: APPLY_TIERS },
      isActive: true,
      jeannieProfile: { isActive: true },
    },
    select: {
      id: true,
      email: true,
      name: true,
      language: true,
    },
    take: 200,
  });

  let shortlists = 0;
  let digests = 0;
  let digestErrors = 0;

  for (const user of subscribers) {
    await ensureActiveSlaPeriod(user.id);

    if (!opts?.digestOnly) {
      try {
        await generateShortlist(user.id, 8);
        shortlists += 1;
      } catch (err) {
        console.warn('[Jeannie] shortlist failed', user.id, err);
      }
    }

    const pending = await db.jeannieOpportunity.findMany({
      where: {
        userId: user.id,
        status: {
          in: [
            JeannieOpportunityStatus.AWAITING_APPROVAL,
            JeannieOpportunityStatus.SUGGESTED,
          ],
        },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ matchScore: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    });

    if (pending.length === 0) continue;

    // Avoid spamming: at most one digest per 10 hours per user.
    const recentDigest = await db.emailQueue.findFirst({
      where: {
        to: user.email,
        subject: { contains: 'Jeannie' },
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 60 * 1000) },
      },
    });
    if (recentDigest) continue;

    const locale = user.language === 'EN' ? 'en' : 'ar';
    const slaSnap = await getSlaSnapshot(user.id);
    const actionBase = `${APP_URL.replace(/\/$/, '')}/api/jeannie/email-action`;

    const items = pending.map((opp) => {
      const approveToken = signJeannieActionToken({
        userId: user.id,
        opportunityId: opp.id,
        action: 'approve',
      });
      const rejectToken = signJeannieActionToken({
        userId: user.id,
        opportunityId: opp.id,
        action: 'reject',
      });
      return {
        id: opp.id,
        title: opp.title,
        companyName: opp.companyName,
        city: opp.city,
        country: opp.country,
        matchScore: opp.matchScore,
        approveUrl: `${actionBase}?token=${encodeURIComponent(approveToken)}`,
        rejectUrl: `${actionBase}?token=${encodeURIComponent(rejectToken)}`,
      };
    });

    try {
      const tpl = await jeannieApprovalDigestEmail({
        userName: user.name || (locale === 'ar' ? 'هناك' : 'there'),
        locale,
        items,
        remainingPromise: slaSnap.remaining,
      });

      // Send soon via queue so cron batching stays consistent.
      await queueEmail({
        to: user.email,
        subject: tpl.subject,
        html: tpl.html,
        sendAt: new Date(),
      });
      digests += 1;
    } catch (err) {
      digestErrors += 1;
      console.warn('[Jeannie] digest failed', user.id, err);
      // Fallback immediate send
      try {
        const tpl = await jeannieApprovalDigestEmail({
          userName: user.name || 'there',
          locale,
          items,
          remainingPromise: slaSnap.remaining,
        });
        await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
        digests += 1;
      } catch {
        /* already counted */
      }
    }
  }

  return {
    sla,
    subscribers: subscribers.length,
    shortlists,
    digests,
    digestErrors,
  };
}
