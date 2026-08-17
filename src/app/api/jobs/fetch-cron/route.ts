import { NextRequest, NextResponse } from 'next/server';
import { runAtsFetchTick } from '@/lib/jobs/ats-fetcher';
import { assertCronAuthorized } from '@/lib/cron-auth';
import { writeAdminNotification } from '@/lib/admin/notify';

/** Keep under Vercel function timeout — robots + 1 rps/domain is slow. */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * ATS aggregator tick. Vercel Hobby was rejecting this project’s crons at
 * deploy time, so vercel.json no longer registers Cron Jobs. Sweep from
 * `.github/workflows/daily-mena-jobs.yml` when repo secret CRON_SECRET is set.
 *
 * Query: `?limit=8` (default 8, max 16). `?sync=1` upserts the company catalog.
 */
export async function GET(req: NextRequest) {
  const authError = assertCronAuthorized(req);
  if (authError) return authError;
  try {
    const rawLimit = Number(req.nextUrl.searchParams.get('limit') || '8');
    const limit = Number.isFinite(rawLimit)
      ? Math.min(16, Math.max(1, Math.floor(rawLimit)))
      : 8;
    const source = req.nextUrl.searchParams.get('source') || 'vercel-cron';
    const syncCatalog = req.nextUrl.searchParams.get('sync') === '1';

    const summary = await runAtsFetchTick({
      limit,
      syncCatalog,
      budgetMs: 45_000,
    });
    if (summary.errors.length > 0 || summary.upserted > 0) {
      await writeAdminNotification({
        channel: 'IN_APP',
        subject:
          summary.errors.length > 0
            ? `ATS tick: ${summary.upserted} jobs, ${summary.errors.length} errors`
            : `ATS tick: +${summary.upserted} jobs across ${summary.companies} companies`,
        body: `[${source}] Companies ${summary.companies}, upserted ${summary.upserted}, deactivated ${summary.deactivated}, skipped ${summary.skipped}.${
          summary.errors.length ? ` Errors: ${summary.errors.slice(0, 3).join('; ')}` : ''
        }`,
        status: summary.errors.length ? 'FAILED' : 'SENT',
        href: '/admin/jobs/aggregator',
        kind: 'jobs',
        severity: summary.errors.length ? 'warn' : 'info',
        meta: { ...summary, source, limit },
      });
    }
    return NextResponse.json({ ok: true, source, limit, ...summary });
  } catch (err) {
    console.error('GET /api/jobs/fetch-cron', err);
    return NextResponse.json({ error: 'Fetch cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
