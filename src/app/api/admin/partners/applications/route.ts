import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

/** PATCH — reject / note a partner application (approve stays on /provision). */
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    applicationId?: string;
    status?: string;
    notes?: string;
  };
  const applicationId = String(body.applicationId || '').trim();
  if (!applicationId) {
    return NextResponse.json({ error: 'applicationId required' }, { status: 400 });
  }

  const status = String(body.status || 'REJECTED').toUpperCase();
  if (!['REJECTED', 'PENDING', 'APPROVED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const app = await db.partnerApplication.update({
    where: { id: applicationId },
    data: {
      status,
      notes: typeof body.notes === 'string' ? body.notes : undefined,
    },
  });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'partner_applications',
      entityId: app.id,
      details: { status },
    });
  }

  return NextResponse.json({ ok: true, application: app });
}
