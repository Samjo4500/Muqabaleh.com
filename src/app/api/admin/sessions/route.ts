import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

/** PATCH { interviewId, action: 'force_stop'|'reopen' } on legacy Interview rows. */
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    interviewId?: string;
    action?: 'force_stop' | 'reopen';
  };
  const interviewId = String(body.interviewId || '').trim();
  if (!interviewId || !body.action) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const status = body.action === 'force_stop' ? 'CANCELLED' : 'PENDING';
  const interview = await db.interview.update({
    where: { id: interviewId },
    data: { status },
    select: { id: true, status: true },
  });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'interview',
      entityId: interview.id,
      details: { action: body.action, status },
    });
  }

  return NextResponse.json({ ok: true, interview });
}
