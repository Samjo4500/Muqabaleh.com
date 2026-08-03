import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  const payout = await db.interviewerPayout.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      paidAt: new Date(),
    },
  });

  await db.adminLog.create({
    data: {
      action: 'PAYOUT_COMPLETED',
      adminEmail: auth.adminEmail!,
      targetType: 'INTERVIEWER_PAYOUT',
      targetId: id,
      metadata: JSON.stringify({ amount: payout.amount }),
    },
  });

  return NextResponse.json(payout);
}
