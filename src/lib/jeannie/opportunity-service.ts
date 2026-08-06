import { db } from '@/lib/db';
import { JeannieOpportunityStatus } from '@prisma/client';
import { assertCanApply, debitApply } from '@/lib/plans/entitlements';
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
 * NOT SPAM apply path: requires prior approval, then debits monthly quota.
 * Internal jobs create JobApplication(source=JEANNIE); external jobs log APPLIED packet.
 */
export async function applyOpportunity(
  userId: string,
  opportunityId: string,
  opts?: { coverLetter?: string; cv?: ApplyCvUpload | null },
) {
  const gate = await assertCanApply(userId);
  if (!gate.ok) return gate;

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

  await db.jeannieOpportunity.update({
    where: { id: opp.id },
    data: { status: JeannieOpportunityStatus.APPLYING, failureReason: null },
  });

  try {
    let cvAssetId = opp.cvAssetId;
    if (opts?.cv) {
      const saved = await saveMediaAsset({
        userId,
        kind: 'CV',
        filename: opts.cv.filename,
        mimeType: opts.cv.mimeType,
        data: opts.cv.data,
      });
      cvAssetId = saved.id;
    } else if (!cvAssetId) {
      const pool = await db.candidatePool.findUnique({ where: { userId } });
      cvAssetId = pool?.cvAssetId || null;
    }

    if (!cvAssetId) {
      throw new Error('CV required — upload a CV before Jeannie applies');
    }

    const coverLetter = opts?.coverLetter?.trim() || opp.coverLetter || null;
    let jobApplicationId = opp.jobApplicationId;

    if (opp.b2bJobId) {
      const job = await db.b2BJob.findFirst({
        where: { id: opp.b2bJobId, isPublic: true, status: 'OPEN' },
      });
      if (!job) throw new Error('Job is no longer open');

      const existing = await db.jobApplication.findUnique({
        where: {
          jobId_candidateId: { jobId: job.id, candidateId: userId },
        },
      });
      if (existing) {
        jobApplicationId = existing.id;
      } else {
        const pool = await db.candidatePool.findUnique({ where: { userId } });
        const created = await db.jobApplication.create({
          data: {
            jobId: job.id,
            candidateId: userId,
            stage: 'NEW',
            source: 'JEANNIE',
            coverLetter,
            cvAssetId,
            photoAssetId: pool?.photoAssetId || null,
            score: pool?.muqabalehScore ?? opp.matchScore,
          },
        });
        jobApplicationId = created.id;
      }
    }

    const debited = await debitApply(userId);
    if (!debited.ok) throw new Error(debited.error);

    const updated = await db.jeannieOpportunity.update({
      where: { id: opp.id },
      data: {
        status: JeannieOpportunityStatus.APPLIED,
        appliedAt: new Date(),
        coverLetter,
        cvAssetId,
        jobApplicationId,
      },
    });

    return {
      ok: true as const,
      opportunity: updated,
      appliesLeft: debited.appliesLeft,
      mode: opp.b2bJobId ? ('internal' as const) : ('external_packet' as const),
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
