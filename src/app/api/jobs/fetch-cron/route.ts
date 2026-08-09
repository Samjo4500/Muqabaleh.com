import { NextRequest, NextResponse } from 'next/server';
import { runAtsFetchTick } from '@/lib/jobs/ats-fetcher';
import { assertCronAuthorized } from '@/lib/cron-auth';

/** Keep under Vercel function timeout — robots + 1 rps/domain is slow. */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/** Vercel Cron — every 6 hours. Legal ATS fetch only. Small batches rotate via updatedAt. */
export async function GET(req: NextRequest) {
  const authError = assertCronAuthorized(req);
  if (authError) return authError;
  try {
    // Rotate through more boards per tick so new employers appear faster
    const summary = await runAtsFetchTick({ limit: 4 });
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error('GET /api/jobs/fetch-cron', err);
    return NextResponse.json({ error: 'Fetch cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
