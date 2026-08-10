import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

const PARTNER_STATUSES = new Set(['PENDING', 'ACTIVE', 'SUSPENDED', 'CHURNED']);

/** GET — full partner portfolio. PATCH — status / commission / notes. */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const partners = await db.partner.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { contactEmail: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { companies: true, users: true, payouts: true, invoices: true } },
      payouts: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, amountCents: true, currency: true, status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 150,
  });

  return NextResponse.json({ items: partners });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    partnerId?: string;
    status?: string;
    commissionBps?: number;
    notes?: string;
    plan?: string;
    customDomainVerified?: boolean;
    customDomain?: string | null;
  };
  const partnerId = String(body.partnerId || '').trim();
  if (!partnerId) {
    return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
  }

  const data: {
    status?: string;
    commissionBps?: number;
    notes?: string | null;
    plan?: string;
    activatedAt?: Date;
    customDomainVerified?: boolean;
    customDomain?: string | null;
  } = {};

  if (body.status) {
    const status = String(body.status).toUpperCase();
    if (!PARTNER_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = status;
    if (status === 'ACTIVE') data.activatedAt = new Date();
  }
  if (typeof body.commissionBps === 'number' && Number.isFinite(body.commissionBps)) {
    data.commissionBps = Math.min(Math.max(Math.round(body.commissionBps), 0), 9000);
  }
  if (typeof body.notes === 'string') data.notes = body.notes;
  if (typeof body.plan === 'string') data.plan = body.plan;
  if (typeof body.customDomainVerified === 'boolean') {
    data.customDomainVerified = body.customDomainVerified;
  }
  if (body.customDomain !== undefined) {
    data.customDomain = body.customDomain
      ? String(body.customDomain)
          .trim()
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/.*$/, '')
      : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields' }, { status: 400 });
  }

  const partner = await db.partner.update({ where: { id: partnerId }, data });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'partner',
      entityId: partner.id,
      details: data,
    });
  }

  return NextResponse.json({ ok: true, partner });
}
