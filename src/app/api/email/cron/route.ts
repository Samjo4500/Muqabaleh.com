import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email';
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

async function runEmailCron() {
  const result = await processEmailQueue();

  // Piggyback Jeannie discovery/digests about every 6 hours on this 5-min cron
  // so Hobby plans with cron limits still keep the promise engine alive.
  const hour = new Date().getUTCHours();
  const minute = new Date().getUTCMinutes();
  let jeannie: Awaited<ReturnType<typeof runJeannieOpsTick>> | null = null;
  if (minute < 5 && hour % 6 === 0) {
    try {
      jeannie = await runJeannieOpsTick();
    } catch (err) {
      console.warn('[email/cron] Jeannie tick failed', err);
    }
  }

  return {
    processed: true,
    sent: result.sent,
    failed: result.failed,
    jeannie,
  };
}

// Vercel Cron uses GET
export async function GET(req: NextRequest) {
  const authError = requireCronSecret(req);
  if (authError) return authError;

  try {
    return NextResponse.json(await runEmailCron());
  } catch (err) {
    console.error('GET /api/email/cron error:', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = requireCronSecret(req);
  if (authError) return authError;

  try {
    return NextResponse.json(await runEmailCron());
  } catch (err) {
    console.error('POST /api/email/cron error:', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
