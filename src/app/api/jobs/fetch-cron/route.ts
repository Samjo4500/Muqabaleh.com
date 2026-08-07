import { NextRequest, NextResponse } from 'next/server';
import { runAtsFetchTick } from '@/lib/jobs/ats-fetcher';

/** Keep under Vercel function timeout — robots + 1 rps/domain is slow. */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function requireCronSecret(req: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Service Unavailable — CRON_SECRET not configured' },
      { status: 503 },
    );
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/** Vercel Cron — every 6 hours. Legal ATS fetch only. Small batches rotate via updatedAt. */
export async function GET(req: NextRequest) {
  const authError = requireCronSecret(req);
  if (authError) return authError;
  try {
    const summary = await runAtsFetchTick({ limit: 2 });
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error('GET /api/jobs/fetch-cron', err);
    return NextResponse.json({ error: 'Fetch cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
