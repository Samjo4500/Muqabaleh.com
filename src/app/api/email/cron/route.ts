import { NextRequest, NextResponse } from 'next/server';
import { assertCronAuthorized } from '@/lib/cron-auth';
import { runEmailCron } from '@/lib/email/run-email-cron';

/**
 * Email + nurture queue.
 * Vercel Hobby was rejecting this project’s crons at deploy time, so
 * scheduling lives in GitHub Actions (`.github/workflows/email-cron.yml`)
 * and requires repo secret CRON_SECRET matching Vercel.
 *
 * Always 200 after auth so Actions can log the JSON body. Queue vs nurture
 * failures are isolated in `errors[]` instead of taking the tick down.
 */

async function handle(req: NextRequest) {
  const authError = assertCronAuthorized(req);
  if (authError) return authError;
  return NextResponse.json(await runEmailCron());
}

// Vercel Cron uses GET
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
