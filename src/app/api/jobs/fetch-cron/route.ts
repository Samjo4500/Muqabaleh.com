import { NextRequest, NextResponse } from 'next/server';
import { runAtsFetchTick } from '@/lib/jobs/ats-fetcher';
import { assertCronAuthorized } from '@/lib/cron-auth';
import { writeAdminNotification } from '@/lib/admin/notify';

/** Keep under Vercel function timeout — robots + 1 rps/domain is slow. */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Vercel Cron — every 3 hours.
 * Syncs verified MENA catalog, then fetches 12 companies/tick so ~24 boards rotate often.
 */
export async function GET(req: NextRequest) {
  const authError = assertCronAuthorized(req);
  if (authError) return authError;
  try {
    const summary = await runAtsFetchTick({ limit: 12, syncCatalog: true });
    if (summary.errors.length > 0 || summary.upserted > 0) {
      await writeAdminNotification({
        channel: 'IN_APP',
        subject:
          summary.errors.length > 0
            ? `ATS tick: ${summary.upserted} jobs, ${summary.errors.length} errors`
            : `ATS tick: +${summary.upserted} jobs across ${summary.companies} companies`,
        body: `Companies ${summary.companies}, upserted ${summary.upserted}, deactivated ${summary.deactivated}, skipped ${summary.skipped}.${
          summary.errors.length ? ` Errors: ${summary.errors.slice(0, 3).join('; ')}` : ''
        }`,
        status: summary.errors.length ? 'FAILED' : 'SENT',
        href: '/admin/jobs/aggregator',
        kind: 'jobs',
        severity: summary.errors.length ? 'warn' : 'info',
        meta: summary,
      });
    }
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error('GET /api/jobs/fetch-cron', err);
    return NextResponse.json({ error: 'Fetch cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
