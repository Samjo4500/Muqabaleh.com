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
  const body = await req.json();
  const { status } = body as { status: 'ACTIVE' | 'BLOCKED' | 'REJECTED' };

  if (!['ACTIVE', 'BLOCKED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const interviewer = await db.interviewer.update({
    where: { id },
    data: { status },
  });

  await db.adminLog.create({
    data: {
      action: `INTERVIEWER_${status}`,
      adminEmail: auth.adminEmail!,
      targetType: 'INTERVIEWER',
      targetId: id,
      metadata: JSON.stringify({ from: 'PENDING', to: status }),
    },
  });

  return NextResponse.json(interviewer);
}
