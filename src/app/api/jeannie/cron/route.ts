import { NextRequest, NextResponse } from 'next/server';
import { runJeannieOpsTick } from '@/lib/jeannie/worker';

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

async function run(req: NextRequest) {
  const authError = requireCronSecret(req);
  if (authError) return authError;

  try {
    const result = await runJeannieOpsTick();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('/api/jeannie/cron', err);
    return NextResponse.json({ error: 'Jeannie cron failed' }, { status: 500 });
  }
}

/** Vercel Cron uses GET — also allow POST for manual ops. */
export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
