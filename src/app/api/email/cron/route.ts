import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email';

// POST /api/email/cron — process scheduled emails
// Called by Vercel Cron or external cron service
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, require Authorization header
    // For Vercel Cron, it sends a special header
    const isVercelCron = req.headers.get('vercel-id') !== null;
    if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

// GET /api/email/cron — health check for cron
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
