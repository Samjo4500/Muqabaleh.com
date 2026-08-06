import { db } from '@/lib/db';
import { JeannieOpportunityStatus } from '@prisma/client';
import { assertCanApply, getEntitlementSnapshot } from '@/lib/plans/entitlements';
import { saveMediaAsset } from '@/lib/ats/media';

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

export async function approveOpportunity(userId: string, opportunityId: string) {
  const opp = await db.jeannieOpportunity.findFirst({
    where: { id: opportunityId, userId },
  });
  if (!opp) return { ok: false as const, error: 'Opportunity not found', status: 404 };
  if (!APPROVABLE.includes(opp.status) && opp.status !== JeannieOpportunityStatus.APPROVED) {
    return { ok: false as const, error: `Cannot approve from status ${opp.status}`, status: 400 };
  }

  const updated = await db.jeannieOpportunity.update({
    where: { id: opp.id },
    data: {
      status: JeannieOpportunityStatus.APPROVED,
      approvedAt: new Date(),
    },
  });
  return { ok: true as const, opportunity: updated };
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
 * NOT SPAM apply path: requires prior approval.
 * - Internal open jobs → create JobApplication + debit quota → APPLIED
 * - External / stub shortlists → prepare PACKET_READY (no debit until a live board connector exists)
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
    opp.status !== JeannieOpportunityStatus.FAILED
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

  await db.jeannieOpportunity.update({
    where: { id: opp.id },
    data: { status: JeannieOpportunityStatus.APPLYING, failureReason: null },
  });

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
    } else if (!cvAssetId) {
      const pool = await db.candidatePool.findUnique({ where: { userId } });
      cvAssetId = pool?.cvAssetId || null;
    }

    if (!cvAssetId) {
      throw new Error('CV required — upload a CV before Jeannie applies');
    }

    const coverLetter = opts?.coverLetter?.trim() || opp.coverLetter || null;
    if (opts?.coverLetter?.trim() && !snap.coverLetterUpload) {
      throw new Error('Cover letter upload is not included in your plan');
    }

    const passportVerificationId = await latestPassportVerificationId(userId);

    // External / stub shortlists: prepare packet only — do not debit apply quota.
    if (!opp.b2bJobId) {
      const updated = await db.jeannieOpportunity.update({
        where: { id: opp.id },
        data: {
          status: JeannieOpportunityStatus.PACKET_READY,
          coverLetter,
          cvAssetId,
          passportVerificationId,
          failureReason: opp.externalUrl
            ? null
            : 'Packet ready. Live external board submission is not connected yet — quota not charged.',
        },
      });
      return {
        ok: true as const,
        opportunity: updated,
        appliesLeft: snap.appliesLeft,
        mode: 'external_packet' as const,
      };
    }

    const gate = await assertCanApply(userId);
    if (!gate.ok) throw new Error(gate.error);

    const job = await db.b2BJob.findFirst({
      where: { id: opp.b2bJobId, isPublic: true, status: 'OPEN' },
    });
    if (!job) throw new Error('Job is no longer open');

    const result = await db.$transaction(async (tx) => {
      const existing = await tx.jobApplication.findUnique({
        where: {
          jobId_candidateId: { jobId: job.id, candidateId: userId },
        },
      });

      let jobApplicationId = existing?.id ?? null;
      if (!existing) {
        const pool = await tx.candidatePool.findUnique({ where: { userId } });
        const created = await tx.jobApplication.create({
          data: {
            jobId: job.id,
            candidateId: userId,
            stage: 'NEW',
            source: 'JEANNIE',
            coverLetter,
            cvAssetId,
            photoAssetId: pool?.photoAssetId || null,
            score:
              pool?.muqabalehScore != null
                ? Math.round(pool.muqabalehScore)
                : opp.matchScore,
          },
        });
        jobApplicationId = created.id;
      }

      const debited = await tx.user.updateMany({
        where: { id: userId, appliesLeft: { gt: 0 } },
        data: { appliesLeft: { decrement: 1 } },
      });
      if (debited.count === 0) {
        throw new Error('Monthly apply quota exhausted');
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { appliesLeft: true },
      });

      const updated = await tx.jeannieOpportunity.update({
        where: { id: opp.id },
        data: {
          status: JeannieOpportunityStatus.APPLIED,
          appliedAt: new Date(),
          coverLetter,
          cvAssetId,
          jobApplicationId,
          passportVerificationId,
          failureReason: null,
        },
      });

      return {
        opportunity: updated,
        appliesLeft: user?.appliesLeft ?? 0,
      };
    });

    return {
      ok: true as const,
      opportunity: result.opportunity,
      appliesLeft: result.appliesLeft,
      mode: 'internal' as const,
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
