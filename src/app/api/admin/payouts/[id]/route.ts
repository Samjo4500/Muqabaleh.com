import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';
import { triggerInterviewerPayoutSentEmail } from '@/lib/email-triggers';
import { z } from 'zod';

const patchSchema = z.object({
  status: z.enum(['COMPLETED', 'REJECTED']),
  adminNote: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { status, adminNote } = parsed.data;

  // Fetch payout
  const payout = await db.interviewerPayout.findUnique({ where: { id } });
  if (!payout) {
    return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
  }

  if (payout.status === 'COMPLETED') {
    return NextResponse.json({ error: 'Payout already completed' }, { status: 400 });
  }

  // Build update data
  const data: Record<string, unknown> = { status };

  if (status === 'COMPLETED') {
    data.completedAt = new Date();
  }

  if (status === 'REJECTED') {
    data.adminNote = adminNote || 'No reason provided';
  }

  const updated = await db.interviewerPayout.update({
    where: { id },
    data,
  });

  // Log admin action
  await db.adminLog.create({
    data: {
      action: status === 'COMPLETED' ? 'PAYOUT_COMPLETED_MANUAL' : 'PAYOUT_REJECTED',
      adminEmail: auth.adminEmail!,
      targetType: 'INTERVIEWER_PAYOUT',
      targetId: id,
      metadata: JSON.stringify({ amount: payout.amount, adminNote }),
    },
  });

  // Send email on completion
  if (status === 'COMPLETED') {
    triggerInterviewerPayoutSentEmail(id, 'ar').catch(() => {});
    triggerInterviewerPayoutSentEmail(id, 'en').catch(() => {});
  }

  return NextResponse.json(updated);
}
