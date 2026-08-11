import { NextResponse } from 'next/server';
import { verifyAdmin } from '../_lib';
import {
  getLastSystemHealthReport,
  runSystemHealthChecks,
} from '@/lib/admin/system-health';
import { writeAdminAudit } from '@/lib/admin/audit';

/** GET — last cached report (or null). */
export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const last = getLastSystemHealthReport();
  return NextResponse.json({
    ok: true,
    report: last,
    cached: Boolean(last),
  });
}

/** POST — run full one-click systems check. */
export async function POST() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const report = await runSystemHealthChecks();

    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'VIEW',
        entity: 'system_health',
        entityId: report.overall,
        details: {
          overall: report.overall,
          durationMs: report.durationMs,
          summary: report.summary,
        },
      });
    }

    return NextResponse.json({ ok: true, report });
  } catch (err) {
    console.error('[api/admin/system-health]', err);
    return NextResponse.json(
      { ok: false, error: 'Systems check failed to run' },
      { status: 500 },
    );
  }
}
