import { NextRequest, NextResponse } from 'next/server';
import { assertCronAuthorized } from '@/lib/cron-auth';
import { buildOperationalBackup, recordBackupLog } from '@/lib/admin/backup-export';
import { writeAdminNotification } from '@/lib/admin/notify';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Daily 02:00 UTC — records an operational backup summary into BackupLog
 * and notifies Super Admin. Full Postgres snapshots remain on Supabase.
 */
export async function GET(req: NextRequest) {
  const authError = assertCronAuthorized(req);
  if (authError) return authError;

  try {
    const setting = await db.adminSetting.findUnique({ where: { key: 'backup' } });
    const value = (setting?.value && typeof setting.value === 'object'
      ? setting.value
      : {}) as { schedule?: string };
    const schedule = String(value.schedule || 'DAILY').toUpperCase();
    if (schedule === 'MANUAL') {
      return NextResponse.json({ ok: true, skipped: true, reason: 'schedule=MANUAL' });
    }
    if (schedule === 'WEEKLY') {
      // Run Mondays only (UTC)
      if (new Date().getUTCDay() !== 1) {
        return NextResponse.json({ ok: true, skipped: true, reason: 'schedule=WEEKLY' });
      }
    }

    const payload = await buildOperationalBackup();
    const sizeBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
    const log = await recordBackupLog({
      type: 'SCHEDULED',
      status: 'COMPLETED',
      notes: `Daily ops snapshot · users ${payload.meta.counts.users} · jobs ${payload.meta.counts.activeListedJobs} · interviews ${payload.meta.counts.interviews}`,
      location: 'supabase-pitr + ops-summary',
      sizeBytes,
    });

    // Persist last snapshot counts (not full dump — keep AdminSetting small)
    await db.adminSetting.upsert({
      where: { key: 'backup_last_snapshot' },
      create: {
        key: 'backup_last_snapshot',
        value: {
          at: payload.meta.generatedAt,
          counts: payload.meta.counts,
          logId: log.id,
        },
      },
      update: {
        value: {
          at: payload.meta.generatedAt,
          counts: payload.meta.counts,
          logId: log.id,
        },
      },
    });

    await writeAdminNotification({
      channel: 'IN_APP',
      subject: 'Daily backup snapshot recorded',
      body: log.notes || 'Scheduled backup complete',
      status: 'SENT',
      href: '/admin/settings/backup',
      kind: 'system',
      severity: 'info',
    });

    return NextResponse.json({ ok: true, logId: log.id, counts: payload.meta.counts });
  } catch (err) {
    console.error('GET /api/backup/cron', err);
    await recordBackupLog({
      type: 'SCHEDULED',
      status: 'FAILED',
      notes: err instanceof Error ? err.message : 'Backup cron failed',
    });
    return NextResponse.json({ error: 'Backup cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
