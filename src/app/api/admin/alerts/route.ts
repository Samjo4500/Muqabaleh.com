import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';
import { countStudent100Pending } from '@/lib/student100/campaign';
import { STUDENT100_ADMIN_PATH, STUDENT100_ALERT_KIND } from '@/lib/student100/admin-inbox';

export type AdminAlert = {
  id: string;
  kind: 'email' | 'queue' | 'ticket' | 'jobs' | 'partner' | 'system' | 'student100';
  severity: 'info' | 'warn' | 'critical';
  title: string;
  body: string;
  href: string;
  createdAt: string;
  unread: boolean;
};

/**
 * GET — inbox for Super Admin bell (emails + ops alerts).
 * PATCH — { ids: string[], read: true } marks NotificationLog rows read via meta.
 */
export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    notifLogs,
    failedQueue,
    pendingQueue,
    openTickets,
    pendingPartners,
    recentJobFails,
    activeJobs,
    pendingStudent100,
  ] = await Promise.all([
    db.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    db.emailQueue.findMany({
      where: { error: { not: null }, createdAt: { gte: dayAgo } },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { id: true, to: true, subject: true, error: true, createdAt: true },
    }),
    db.emailQueue.count({
      where: { sent: false, error: null, sendAt: { lte: new Date() } },
    }),
    db.supportTicket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
    }),
    db.partnerApplication.count({ where: { status: 'PENDING' } }),
    db.jobFetchLog.findMany({
      where: {
        createdAt: { gte: dayAgo },
        OR: [{ statusCode: { gte: 400 } }, { errorMessage: { not: null } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { company: { select: { name: true, slug: true } } },
    }),
    db.listedJob.count({ where: { isActive: true } }),
    countStudent100Pending(),
  ]);

  const alerts: AdminAlert[] = [];

  for (const n of notifLogs) {
    const meta = (n.meta && typeof n.meta === 'object' ? n.meta : {}) as {
      unread?: boolean;
      href?: string;
      kind?: AdminAlert['kind'];
      severity?: AdminAlert['severity'];
    };
    alerts.push({
      id: `notif:${n.id}`,
      kind: (meta.kind as AdminAlert['kind']) || (n.channel === 'EMAIL' ? 'email' : 'system'),
      severity:
        meta.severity ||
        (n.status === 'FAILED' ? 'critical' : n.status === 'QUEUED' ? 'warn' : 'info'),
      title: n.subject || 'Notification',
      body: (n.body || '').slice(0, 180),
      href: meta.href || '/admin/notifications',
      createdAt: n.createdAt.toISOString(),
      unread: meta.unread !== false && n.status !== 'READ',
    });
  }

  for (const q of failedQueue) {
    alerts.push({
      id: `queue-fail:${q.id}`,
      kind: 'queue',
      severity: 'critical',
      title: `Email failed: ${q.subject}`,
      body: `${q.to} — ${(q.error || '').slice(0, 120)}`,
      href: '/admin/content/email-queue',
      createdAt: q.createdAt.toISOString(),
      unread: true,
    });
  }

  if (pendingQueue > 0) {
    alerts.push({
      id: 'queue-pending',
      kind: 'queue',
      severity: 'warn',
      title: `${pendingQueue} emails due in queue`,
      body: 'Process the email queue or wait for the */5 cron.',
      href: '/admin/content/email-queue',
      createdAt: new Date().toISOString(),
      unread: true,
    });
  }

  if (pendingStudent100 > 0) {
    alerts.push({
      id: 'student100-pending',
      kind: STUDENT100_ALERT_KIND,
      severity: 'warn',
      title: `${pendingStudent100} Student 100 application${pendingStudent100 === 1 ? '' : 's'} need review`,
      body: 'Open the Student 100 Contact Center — separate from support tickets.',
      href: STUDENT100_ADMIN_PATH,
      createdAt: new Date().toISOString(),
      unread: true,
    });
  }

  if (openTickets > 0) {
    alerts.push({
      id: 'tickets-open',
      kind: 'ticket',
      severity: openTickets > 5 ? 'warn' : 'info',
      title: `${openTickets} open support tickets`,
      body: 'Assign or close from Support → Tickets.',
      href: '/admin/support/tickets',
      createdAt: new Date().toISOString(),
      unread: true,
    });
  }

  if (pendingPartners > 0) {
    alerts.push({
      id: 'partners-pending',
      kind: 'partner',
      severity: 'warn',
      title: `${pendingPartners} partner applications pending`,
      body: 'Review and approve/reject partnership requests.',
      href: '/admin/partners/applications',
      createdAt: new Date().toISOString(),
      unread: true,
    });
  }

  for (const log of recentJobFails.slice(0, 5)) {
    alerts.push({
      id: `jobs:${log.id}`,
      kind: 'jobs',
      severity: 'warn',
      title: `ATS fetch issue: ${log.company?.name || 'company'}`,
      body: log.errorMessage || `HTTP ${log.statusCode ?? '—'}`,
      href: '/admin/jobs/aggregator',
      createdAt: log.createdAt.toISOString(),
      unread: true,
    });
  }

  alerts.push({
    id: 'jobs-active-count',
    kind: 'jobs',
    severity: 'info',
    title: `${activeJobs} active listed jobs`,
    body: 'Board inventory from the ATS aggregator.',
    href: '/admin/jobs/aggregator',
    createdAt: new Date().toISOString(),
    unread: false,
  });

  alerts.sort((a, b) => {
    const pin = Number(b.kind === STUDENT100_ALERT_KIND) - Number(a.kind === STUDENT100_ALERT_KIND);
    if (pin !== 0) return pin;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const unreadCount = alerts.filter((a) => a.unread).length;

  return NextResponse.json({
    alerts: alerts.slice(0, 50),
    unreadCount,
    counts: {
      pendingQueue,
      openTickets,
      pendingPartners,
      activeJobs,
      failedQueue: failedQueue.length,
      pendingStudent100,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    ids?: string[];
    readAll?: boolean;
  };

  if (body.readAll) {
    const recent = await db.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, meta: true },
    });
    await Promise.all(
      recent.map((row) =>
        db.notificationLog.update({
          where: { id: row.id },
          data: {
            status: 'READ',
            meta: {
              ...((row.meta && typeof row.meta === 'object' ? row.meta : {}) as object),
              unread: false,
            },
          },
        }),
      ),
    );
  } else {
    const ids = (body.ids || [])
      .map((id) => String(id).replace(/^notif:/, ''))
      .filter(Boolean);
    for (const id of ids) {
      const row = await db.notificationLog.findUnique({ where: { id } });
      if (!row) continue;
      await db.notificationLog.update({
        where: { id },
        data: {
          status: 'READ',
          meta: {
            ...((row.meta && typeof row.meta === 'object' ? row.meta : {}) as object),
            unread: false,
          },
        },
      });
    }
  }

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'notification_logs',
      details: { readAll: !!body.readAll, ids: body.ids ?? [] },
    });
  }

  return NextResponse.json({ ok: true });
}
