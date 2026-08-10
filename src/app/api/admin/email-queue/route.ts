import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';
import { processEmailQueue } from '@/lib/email';

/** GET queue rows. POST { action: 'process' } runs due sends. */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const filter = req.nextUrl.searchParams.get('filter') || 'all'; // pending|sent|failed|all
  const where =
    filter === 'pending'
      ? { sent: false, error: null }
      : filter === 'sent'
        ? { sent: true }
        : filter === 'failed'
          ? { error: { not: null } }
          : undefined;

  const items = await db.emailQueue.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      to: true,
      subject: true,
      from: true,
      sendAt: true,
      sent: true,
      sentAt: true,
      error: true,
      createdAt: true,
    },
  });

  const [pending, sent, failed] = await Promise.all([
    db.emailQueue.count({ where: { sent: false, error: null } }),
    db.emailQueue.count({ where: { sent: true } }),
    db.emailQueue.count({ where: { error: { not: null } } }),
  ]);

  return NextResponse.json({ items, counts: { pending, sent, failed } });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as { action?: string };
  if (body.action !== 'process') {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  const result = await processEmailQueue();

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'email_queue',
      details: { action: 'process', result },
    });
  }

  return NextResponse.json({ ok: true, result });
}
