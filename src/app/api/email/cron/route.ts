import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email';
import { processNurtureQueue } from '@/lib/nurture/process';
import { assertCronAuthorized } from '@/lib/cron-auth';

/**
 * Email + nurture queue.
 * Vercel Hobby was rejecting this project’s crons at deploy time, so
 * scheduling lives in GitHub Actions (`.github/workflows/email-cron.yml`)
 * and requires repo secret CRON_SECRET matching Vercel.
 */

async function runEmailCron() {
  const result = await processEmailQueue();
  const nurture = await processNurtureQueue();
  return {
    processed: true,
    sent: result.sent,
    failed: result.failed,
    nurture,
  };
}

// Vercel Cron uses GET
export async function GET(req: NextRequest) {
  const authError = assertCronAuthorized(req);
  if (authError) return authError;

  try {
    return NextResponse.json(await runEmailCron());
  } catch (err) {
    console.error('GET /api/email/cron error:', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = assertCronAuthorized(req);
  if (authError) return authError;

  try {
    return NextResponse.json(await runEmailCron());
  } catch (err) {
    console.error('POST /api/email/cron error:', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
