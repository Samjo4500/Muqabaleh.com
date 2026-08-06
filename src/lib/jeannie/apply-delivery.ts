import { db } from '@/lib/db';
import { JeannieOpportunityStatus } from '@prisma/client';
import { sendEmail } from '@/lib/email';
import { getMediaAsset } from '@/lib/ats/media';
import { jeannieEmployerApplyEmail } from '@/emails/jeannie-employer-apply';
import { jeannieAppliedReceiptEmail } from '@/emails/jeannie-applied-receipt';
import { assertCanApply, getEntitlementSnapshot } from '@/lib/plans/entitlements';
import { getSlaSnapshot, recordDeliveredApply } from './sla';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://muqabaleh.com';

/**
 * Deliver an approved opportunity to the employer (email packet)
 * or finalize a tracked URL packet — then debit quota + SLA.
 */
export async function deliverApprovedOpportunity(userId: string, opportunityId: string) {
  const snap = await getEntitlementSnapshot(userId);
  if (!snap?.canUseJeannie) {
    return { ok: false as const, error: 'Jeannie plan required', status: 403 };
  }

  const opp = await db.jeannieOpportunity.findFirst({
    where: { id: opportunityId, userId },
  });
  if (!opp) return { ok: false as const, error: 'Opportunity not found', status: 404 };

  if (opp.status === JeannieOpportunityStatus.APPLIED) {
    return { ok: true as const, opportunity: opp, already: true as const };
  }

  if (
    opp.status !== JeannieOpportunityStatus.APPROVED &&
    opp.status !== JeannieOpportunityStatus.FAILED &&
    opp.status !== JeannieOpportunityStatus.PACKET_READY
  ) {
    return {
      ok: false as const,
      error: 'Opportunity must be approved before delivery',
      status: 400,
    };
  }

  const gate = await assertCanApply(userId);
  if (!gate.ok) return { ok: false as const, error: gate.error, status: 402 };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, language: true },
  });
  if (!user) return { ok: false as const, error: 'User not found', status: 404 };

  let cvAssetId = opp.cvAssetId;
  if (!cvAssetId) {
    const pool = await db.candidatePool.findUnique({ where: { userId } });
    cvAssetId = pool?.cvAssetId || null;
  }
  if (!cvAssetId) {
    return {
      ok: false as const,
      error: 'CV required — upload a CV in Jeannie workspace before applies',
      status: 400,
    };
  }

  const media = await getMediaAsset(cvAssetId);
  if (!media) {
    return { ok: false as const, error: 'CV file missing', status: 400 };
  }

  await db.jeannieOpportunity.update({
    where: { id: opp.id },
    data: { status: JeannieOpportunityStatus.APPLYING, failureReason: null, cvAssetId },
  });

  const locale = user.language === 'EN' ? 'en' : 'ar';
  const candidateName = user.name || 'Candidate';
  const passportVerificationId = opp.passportVerificationId;
  const passportUrl = passportVerificationId
    ? `${APP_URL.replace(/\/$/, '')}${locale === 'en' ? '/en' : ''}/verify/${passportVerificationId}`
    : null;

  const applyEmail = opp.applyEmail;
  const channel = (opp.applyChannel === 'EMAIL' && applyEmail ? 'EMAIL' : 'URL_PACKET') as
    | 'EMAIL'
    | 'URL_PACKET';

  let employerMsgId: string | null = null;

  try {
    if (channel === 'EMAIL' && applyEmail) {
      const tpl = await jeannieEmployerApplyEmail({
        candidateName,
        roleTitle: opp.title,
        companyName: opp.companyName,
        coverLetter: opp.coverLetter,
        passportUrl,
        locale,
      });

      const sent = await sendEmail({
        to: applyEmail,
        subject: tpl.subject,
        html: tpl.html,
        replyTo: user.email,
        cc: user.email,
        attachments: [
          {
            filename: media.filename || 'CV.pdf',
            content: Buffer.from(media.data),
            contentType: media.mimeType,
          },
        ],
      });

      if (!sent.success) {
        // Fall back to tracked packet so the promise engine can still progress
        // via URL_PACKET when Resend is unavailable — still counts as delivered
        // only after we finalize below with URL_PACKET semantics.
        if (sent.error === 'Email service not configured' && opp.externalUrl) {
          // continue as URL_PACKET
        } else {
          throw new Error(sent.error || 'Employer email failed');
        }
      } else {
        employerMsgId = sent.id || null;
      }
    }

    // URL_PACKET: packet is complete + tracked; candidate/employer link stored.
    // Counts as delivered promise when we have a concrete external URL or emailed.
    const deliveredViaEmail = Boolean(employerMsgId);
    if (!deliveredViaEmail && !opp.externalUrl && !applyEmail) {
      throw new Error('No employer email or apply URL available for this role');
    }

    const finalChannel = deliveredViaEmail ? 'EMAIL' : 'URL_PACKET';

    const result = await db.$transaction(async (tx) => {
      const debited = await tx.user.updateMany({
        where: { id: userId, appliesLeft: { gt: 0 } },
        data: { appliesLeft: { decrement: 1 } },
      });
      if (debited.count === 0) {
        throw new Error('Monthly apply quota exhausted');
      }

      const updated = await tx.jeannieOpportunity.update({
        where: { id: opp.id },
        data: {
          status: JeannieOpportunityStatus.APPLIED,
          appliedAt: new Date(),
          applyChannel: finalChannel,
          employerMsgId,
          cvAssetId,
          failureReason: null,
        },
      });

      const left = await tx.user.findUnique({
        where: { id: userId },
        select: { appliesLeft: true },
      });

      return { opportunity: updated, appliesLeft: left?.appliesLeft ?? 0 };
    });

    await recordDeliveredApply(userId);
    const sla = await getSlaSnapshot(userId);

    const receipt = await jeannieAppliedReceiptEmail({
      userName: candidateName,
      locale,
      title: opp.title,
      companyName: opp.companyName,
      channel: finalChannel,
      remainingPromise: sla.remaining,
      delivered: sla.delivered,
      promised: sla.promised,
    });
    await sendEmail({ to: user.email, subject: receipt.subject, html: receipt.html });

    return {
      ok: true as const,
      opportunity: result.opportunity,
      appliesLeft: result.appliesLeft,
      mode: finalChannel === 'EMAIL' ? ('external_email' as const) : ('external_url' as const),
      sla,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delivery failed';
    await db.jeannieOpportunity.update({
      where: { id: opp.id },
      data: {
        status: JeannieOpportunityStatus.FAILED,
        failureReason: message,
      },
    });
    return { ok: false as const, error: message, status: 400 };
  }
}
