import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email';

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

// POST /api/email/cron — process scheduled emails
// Called by Vercel Cron or external cron service
export async function POST(req: NextRequest) {
  const authError = requireCronSecret(req);
  if (authError) return authError;

  try {
    const result = await processEmailQueue();

    return NextResponse.json({
      processed: true,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (err) {
    console.error('POST /api/email/cron error:', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}

// GET /api/email/cron — health check for cron (also requires secret)
export async function GET(req: NextRequest) {
  const authError = requireCronSecret(req);
  if (authError) return authError;
  return NextResponse.json({ status: 'ok' });
}
