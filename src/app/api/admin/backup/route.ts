import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';
import { buildOperationalBackup, recordBackupLog } from '@/lib/admin/backup-export';
import { writeAdminNotification } from '@/lib/admin/notify';
import { db } from '@/lib/db';

/**
 * GET ?download=1 — download operational JSON export
 * POST { action: 'export'|'health'|'note', notes? }
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  if (req.nextUrl.searchParams.get('download') === '1') {
    const payload = await buildOperationalBackup();
    const body = JSON.stringify(payload, null, 2);
    const sizeBytes = Buffer.byteLength(body, 'utf8');
    await recordBackupLog({
      type: 'EXPORT',
      status: 'COMPLETED',
      notes: `Manual download · ${payload.meta.counts.users} users · ${payload.meta.counts.activeListedJobs} jobs`,
      location: 'browser-download',
      sizeBytes,
    });
    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'VIEW',
        entity: 'backup',
        details: { action: 'download', sizeBytes },
      });
    }
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="muqabaleh-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.json"`,
      },
    });
  }

  const logs = await db.backupLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({
    logs,
    guidance: {
      database:
        'Full Postgres backups/PITR are managed in Supabase (project → Database → Backups).',
      website:
        'Website source of truth is GitHub + Vercel deployments (redeploy any prior commit).',
      operational:
        'Use Export for an app-level JSON snapshot of key tables (no secrets/password hashes).',
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    action?: 'export' | 'health' | 'note';
    notes?: string;
  };

  if (body.action === 'health') {
    const started = Date.now();
    const [users, jobs, payments] = await Promise.all([
      db.user.count(),
      db.listedJob.count({ where: { isActive: true } }),
      db.payment.count(),
    ]);
    const ms = Date.now() - started;
    const log = await recordBackupLog({
      type: 'HEALTH',
      status: 'COMPLETED',
      notes: `OK in ${ms}ms · users=${users} jobs=${jobs} payments=${payments}`,
    });
    return NextResponse.json({ ok: true, log, latencyMs: ms, users, jobs, payments });
  }

  if (body.action === 'note') {
    const log = await recordBackupLog({
      type: 'MANUAL',
      status: 'COMPLETED',
      notes: body.notes || 'Operator note',
      location: 'supabase-external',
    });
    return NextResponse.json({ ok: true, log });
  }

  // export — store summary log; client should call GET ?download=1 for file
  const payload = await buildOperationalBackup();
  const sizeBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const log = await recordBackupLog({
    type: 'EXPORT',
    status: 'COMPLETED',
    notes: `Snapshot ready · users ${payload.meta.counts.users} · jobs ${payload.meta.counts.activeListedJobs}`,
    location: 'download-via-get',
    sizeBytes,
  });

  await writeAdminNotification({
    channel: 'IN_APP',
    subject: 'Operational backup export ready',
    body: log.notes || 'Export completed',
    status: 'SENT',
    href: '/admin/settings/backup',
    kind: 'system',
    severity: 'info',
  });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'CREATE',
      entity: 'backup_logs',
      entityId: log.id,
      details: { sizeBytes },
    });
  }

  return NextResponse.json({ ok: true, log, counts: payload.meta.counts });
}
