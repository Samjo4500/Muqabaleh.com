import { db } from '@/lib/db';
import { JeannieOpportunityStatus } from '@prisma/client';
import { getEntitlementSnapshot } from '@/lib/plans/entitlements';
import { saveMediaAsset } from '@/lib/ats/media';
import { deliverApprovedOpportunity } from './apply-delivery';

const APPROVABLE: JeannieOpportunityStatus[] = [
  JeannieOpportunityStatus.SUGGESTED,
  JeannieOpportunityStatus.AWAITING_APPROVAL,
];

export async function listOpportunities(userId: string, status?: JeannieOpportunityStatus) {
  return db.jeannieOpportunity.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    orderBy: [{ matchScore: 'desc' }, { createdAt: 'desc' }],
    take: 50,
  });
}

export type ApplyCvUpload = {
  filename: string;
  mimeType: string;
  data: Buffer;
};

async function latestPassportVerificationId(userId: string): Promise<string | null> {
  const interview = await db.interview.findFirst({
    where: {
      userId,
      status: 'COMPLETED',
      overallScore: { not: null },
      verificationId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    select: { verificationId: true },
  });
  return interview?.verificationId ?? null;
}

/**
 * Approve opportunity (NOT SPAM gate), then Jeannie auto-delivers the apply.
 */
export async function approveOpportunity(
  userId: string,
  opportunityId: string,
  opts?: { autoApply?: boolean },
) {
  const opp = await db.jeannieOpportunity.findFirst({
    where: { id: opportunityId, userId },
  });
  if (!opp) return { ok: false as const, error: 'Opportunity not found', status: 404 };
  if (!APPROVABLE.includes(opp.status) && opp.status !== JeannieOpportunityStatus.APPROVED) {
    return { ok: false as const, error: `Cannot approve from status ${opp.status}`, status: 400 };
  }

  const passportVerificationId =
    opp.passportVerificationId || (await latestPassportVerificationId(userId));

  const updated = await db.jeannieOpportunity.update({
    where: { id: opp.id },
    data: {
      status: JeannieOpportunityStatus.APPROVED,
      approvedAt: new Date(),
      passportVerificationId,
    },
  });

  const autoApply = opts?.autoApply !== false;
  if (!autoApply) {
    return { ok: true as const, opportunity: updated };
  }

  const delivered = await deliverApprovedOpportunity(userId, opportunityId);
  if (!delivered.ok) {
    // Stay APPROVED so user can retry apply after fixing CV / quota
    return {
      ok: true as const,
      opportunity: updated,
      deliveryError: delivered.error,
    };
  }

  return {
    ok: true as const,
    opportunity: delivered.opportunity,
    appliesLeft: delivered.appliesLeft,
    mode: delivered.mode,
    sla: delivered.sla,
  };
}

export async function rejectOpportunity(userId: string, opportunityId: string) {
  const opp = await db.jeannieOpportunity.findFirst({
    where: { id: opportunityId, userId },
  });
  if (!opp) return { ok: false as const, error: 'Opportunity not found', status: 404 };

  const updated = await db.jeannieOpportunity.update({
    where: { id: opp.id },
    data: {
      status: JeannieOpportunityStatus.REJECTED_BY_USER,
      rejectedAt: new Date(),
    },
  });
  return { ok: true as const, opportunity: updated };
}

/**
 * Manual/retry apply path after approval (or FAILED retry).
 * External jobs → email / URL packet delivery with SLA debit.
 */
export async function applyOpportunity(
  userId: string,
  opportunityId: string,
  opts?: { coverLetter?: string; cv?: ApplyCvUpload | null },
) {
  const snap = await getEntitlementSnapshot(userId);
  if (!snap) return { ok: false as const, error: 'User not found', status: 404 };
  if (!snap.canUseJeannie) {
    return {
      ok: false as const,
      error: 'Jeannie applies require a Jeannie plan',
      status: 403,
    };
  }

  const opp = await db.jeannieOpportunity.findFirst({
    where: { id: opportunityId, userId },
  });
  if (!opp) return { ok: false as const, error: 'Opportunity not found', status: 404 };

  if (
    opp.status !== JeannieOpportunityStatus.APPROVED &&
    opp.status !== JeannieOpportunityStatus.FAILED &&
    opp.status !== JeannieOpportunityStatus.PACKET_READY
  ) {
    return {
      ok: false as const,
      error: 'Approve this opportunity before Jeannie can apply (NOT SPAM).',
      status: 400,
    };
  }

  if (opp.expiresAt && opp.expiresAt.getTime() <= Date.now()) {
    await db.jeannieOpportunity.update({
      where: { id: opp.id },
      data: { status: JeannieOpportunityStatus.EXPIRED },
    });
    return { ok: false as const, error: 'This opportunity has expired', status: 400 };
  }

  try {
    let cvAssetId = opp.cvAssetId;
    if (opts?.cv) {
      if (!snap.cvUpload) {
        throw new Error('CV upload is not included in your plan');
      }
      const saved = await saveMediaAsset({
        userId,
        kind: 'CV',
        filename: opts.cv.filename,
        mimeType: opts.cv.mimeType,
        data: opts.cv.data,
      });
      cvAssetId = saved.id;
      await db.candidatePool.upsert({
        where: { userId },
        create: {
          userId,
          role: 'Professional',
          level: 'MID',
          cvAssetId: saved.id,
          cvFileName: opts.cv.filename,
        },
        update: {
          cvAssetId: saved.id,
          cvFileName: opts.cv.filename,
        },
      });
    }

    const coverLetter = opts?.coverLetter?.trim() || opp.coverLetter || null;
    if (opts?.coverLetter?.trim() && !snap.coverLetterUpload) {
      throw new Error('Cover letter upload is not included in your plan');
    }

    const passportVerificationId =
      opp.passportVerificationId || (await latestPassportVerificationId(userId));

    await db.jeannieOpportunity.update({
      where: { id: opp.id },
      data: {
        status: JeannieOpportunityStatus.APPROVED,
        coverLetter,
        cvAssetId,
        passportVerificationId,
        failureReason: null,
      },
    });

    const delivered = await deliverApprovedOpportunity(userId, opportunityId);
    if (!delivered.ok) {
      return { ok: false as const, error: delivered.error, status: delivered.status };
    }

    return {
      ok: true as const,
      opportunity: delivered.opportunity,
      appliesLeft: delivered.appliesLeft,
      mode: delivered.mode,
      sla: delivered.sla,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Apply failed';
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
