import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

/** GET partner payouts. PATCH status for a payout row. */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const items = await db.partnerPayout.findMany({
    where: q
      ? {
          OR: [
            { partner: { name: { contains: q, mode: 'insensitive' } } },
            { partner: { slug: { contains: q, mode: 'insensitive' } } },
            { note: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      partner: { select: { id: true, name: true, slug: true, contactEmail: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const totals = await db.partnerPayout.groupBy({
    by: ['status'],
    _sum: { amountCents: true },
    _count: { _all: true },
  });

  return NextResponse.json({ items, totals });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    payoutId?: string;
    status?: string;
    note?: string;
  };
  const payoutId = String(body.payoutId || '').trim();
  const status = String(body.status || '').toUpperCase();
  if (!payoutId || !['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const payout = await db.partnerPayout.update({
    where: { id: payoutId },
    data: {
      status,
      note: typeof body.note === 'string' ? body.note : undefined,
      paidAt: status === 'COMPLETED' ? new Date() : undefined,
    },
  });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'partner_payout',
      entityId: payout.id,
      details: { status },
    });
  }

  return NextResponse.json({ ok: true, payout });
}
