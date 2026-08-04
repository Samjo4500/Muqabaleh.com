import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';
import { triggerInterviewerApprovedEmail } from '@/lib/email-triggers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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

    // Send approval email if status changed to ACTIVE
    if (status === 'ACTIVE') {
      triggerInterviewerApprovedEmail(id, 'ar').catch(() => {});
      triggerInterviewerApprovedEmail(id, 'en').catch(() => {});
    }

    return NextResponse.json(interviewer);
  } catch (err) {
    console.error('PATCH /api/admin/interviewers/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
