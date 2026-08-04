import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PayoutStatus } from '@/lib/enums';
import { verifyAdmin } from '../../_lib';
import { triggerInterviewerPayoutSentEmail } from '@/lib/email-triggers';
import { z } from 'zod';

const patchSchema = z.object({
  status: z.enum([PayoutStatus.COMPLETED, PayoutStatus.REJECTED, PayoutStatus.FAILED]),
  adminNote: z.string().optional(),
  batchId: z.string().optional(),
  /** @deprecated alias — prefer batchId */
  paypalBatchId: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const { status, adminNote } = parsed.data;
    const incomingBatchId = parsed.data.batchId || parsed.data.paypalBatchId;

    const payout = await db.interviewerPayout.findUnique({ where: { id } });
    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    if (payout.status === PayoutStatus.COMPLETED) {
      return NextResponse.json({ error: 'Payout already completed' }, { status: 400 });
    }

    const data: Record<string, unknown> = { status };

    if (status === PayoutStatus.COMPLETED) {
      // Reject if neither stored batchId nor incoming batchId/paypalBatchId is present
      const resolvedBatchId = payout.batchId || incomingBatchId || null;
      if (!resolvedBatchId) {
        return NextResponse.json(
          {
            error:
              'batchId is required to mark payout COMPLETED (process via PayPal or provide batchId)',
          },
          { status: 400 },
        );
      }
      data.batchId = resolvedBatchId;
      data.completedAt = new Date();
    }

    if (status === PayoutStatus.REJECTED || status === PayoutStatus.FAILED) {
      data.adminNote = adminNote || 'No reason provided';
    }

    const updated = await db.interviewerPayout.update({
      where: { id },
      data,
    });

    await db.adminLog.create({
      data: {
        action:
          status === PayoutStatus.COMPLETED
            ? 'PAYOUT_COMPLETED_MANUAL'
            : status === PayoutStatus.FAILED
              ? 'PAYOUT_FAILED'
              : 'PAYOUT_REJECTED',
        adminEmail: auth.adminEmail!,
        targetType: 'INTERVIEWER_PAYOUT',
        targetId: id,
        metadata: JSON.stringify({
          amount: payout.amount,
          adminNote,
          batchId: updated.batchId,
        }),
      },
    });

    if (status === PayoutStatus.COMPLETED) {
      triggerInterviewerPayoutSentEmail(id, 'ar').catch(() => {});
      triggerInterviewerPayoutSentEmail(id, 'en').catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/admin/payouts/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
