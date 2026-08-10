import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

/** PATCH { keyId, isActive } — revoke/reactivate API key records (hints only, no secrets). */
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    keyId?: string;
    isActive?: boolean;
  };
  const keyId = String(body.keyId || '').trim();
  if (!keyId || typeof body.isActive !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const row = await db.apiKeyRecord.update({
    where: { id: keyId },
    data: { isActive: body.isActive },
    select: { id: true, provider: true, label: true, isActive: true },
  });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'api_key',
      entityId: row.id,
      details: { isActive: row.isActive },
    });
  }

  return NextResponse.json({ ok: true, key: row });
}
