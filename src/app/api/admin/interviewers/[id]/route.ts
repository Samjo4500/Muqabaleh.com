import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { InterviewerStatus } from '@/lib/enums';
import { verifyAdmin } from '../../_lib';
import { triggerInterviewerApprovedEmail } from '@/lib/email-triggers';

const ALLOWED_STATUSES = [
  InterviewerStatus.ACTIVE,
  InterviewerStatus.SUSPENDED,
  InterviewerStatus.REJECTED,
] as const;

type AdminInterviewerStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const body = await req.json();
    let { status } = body as { status: string };

    // Legacy client payloads used BLOCKED; map to SUSPENDED
    if (status === 'BLOCKED') status = InterviewerStatus.SUSPENDED;

    if (!ALLOWED_STATUSES.includes(status as AdminInterviewerStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const interviewer = await db.interviewer.update({
      where: { id },
      data: { status: status as AdminInterviewerStatus },
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
    if (status === InterviewerStatus.ACTIVE) {
      triggerInterviewerApprovedEmail(id, 'ar').catch(() => {});
      triggerInterviewerApprovedEmail(id, 'en').catch(() => {});
    }

    return NextResponse.json(interviewer);
  } catch (err) {
    console.error('PATCH /api/admin/interviewers/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
